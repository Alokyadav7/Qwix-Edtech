import { ChatMessage } from "../models/ChatMessage.js";
import { User } from "../models/User.js";
import { createNotification } from "../services/notification.service.js";
import { getIO } from "../config/socket.js";
import { ApiError } from "../utils/ApiError.js";
import { pageOptions } from "../utils/helpers.js";

function conversationId(left, right) {
  return [String(left), String(right)].sort().join(":");
}

export async function conversations(request, response) {
  const rows = await ChatMessage.aggregate([
    { $match: { participants: request.user._id } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$conversation",
        lastMessage: { $first: "$$ROOT" },
        unread: {
          $sum: {
            $cond: [
              { $and: [{ $ne: ["$sender", request.user._id] }, { $eq: ["$isRead", false] }] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { "lastMessage.createdAt": -1 } },
    { $limit: 50 }
  ]);

  // Hydrate the other participant's info for each conversation
  const otherIds = rows.map((r) => {
    const parts = r._id.split(":");
    return parts.find((p) => p !== request.user.id);
  }).filter(Boolean);

  const users = await User.find({ _id: { $in: otherIds } }).select("name avatar _id");

  const enriched = rows.map((r) => {
    const parts = r._id.split(":");
    const otherId = parts.find((p) => p !== request.user.id);
    const other = users.find((u) => String(u._id) === otherId);
    return { ...r, participant: other ?? { _id: otherId } };
  });

  response.json({ success: true, data: { conversations: enriched } });
}

export async function messages(request, response) {
  const { page, limit, skip } = pageOptions(request.query);
  const convoId = conversationId(request.user.id, request.params.userId);
  const rows = await ChatMessage.find({ conversation: convoId })
    .populate("sender", "name avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Auto-mark fetched messages as read (for messages FROM the other user)
  const unreadIds = rows
    .filter((m) => String(m.sender._id ?? m.sender) !== request.user.id && !m.isRead)
    .map((m) => m._id);
  if (unreadIds.length) {
    await ChatMessage.updateMany({ _id: { $in: unreadIds } }, { isRead: true, readAt: new Date() });
  }

  response.json({ success: true, data: { messages: rows.reverse(), page, limit } });
}

export async function send(request, response) {
  if (!request.body.content && !request.body.fileUrl) {
    throw new ApiError(400, "Message content or file is required.");
  }
  const convoId = conversationId(request.user.id, request.params.userId);
  const message = await ChatMessage.create({
    conversation: convoId,
    participants: [request.user.id, request.params.userId],
    sender: request.user.id,
    content: request.body.content,
    type: request.body.type ?? "text",
    fileUrl: request.body.fileUrl
  });

  // Emit message via Socket.IO to the recipient if they are online
  getIO()
    ?.of("/chat")
    ?.to(`user:${request.params.userId}`)
    ?.emit("new-message", { message, from: { id: request.user.id, name: request.user.name } });

  // Persistent notification (only if socket wasn't delivered)
  await createNotification({
    userId: request.params.userId,
    type: "message",
    title: `New message from ${request.user.name}`,
    body: request.body.content?.slice(0, 120) ?? "Sent a file.",
    action: `/chat/${request.user.id}`
  });

  response.status(201).json({ success: true, data: { message } });
}

// Mark a specific message as read
export async function markRead(request, response) {
  const message = await ChatMessage.findOneAndUpdate(
    { _id: request.params.id, participants: request.user._id, isRead: false },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!message) throw new ApiError(404, "Message was not found or already read.");
  response.json({ success: true, data: { message } });
}

// Mark all messages in a conversation as read
export async function markConversationRead(request, response) {
  const convoId = conversationId(request.user.id, request.params.userId);
  const result = await ChatMessage.updateMany(
    { conversation: convoId, sender: { $ne: request.user.id }, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  response.json({ success: true, data: { updated: result.modifiedCount } });
}

export async function remove(request, response) {
  const message = await ChatMessage.findOneAndDelete({
    _id: request.params.id,
    sender: request.user.id
  });
  if (!message) throw new ApiError(404, "Message was not found.");

  // Notify recipient of deletion
  getIO()
    ?.of("/chat")
    ?.to(`user:${message.participants.find((p) => String(p) !== request.user.id)}`)
    ?.emit("message-deleted", { messageId: message.id });

  response.status(204).end();
}
