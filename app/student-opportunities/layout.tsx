import type { ReactNode } from "react";

import { StudentOpportunityShell } from "../../components/student-opportunities/site-shell";
import "./elevate.css";

export default function StudentOpportunitiesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <StudentOpportunityShell>{children}</StudentOpportunityShell>;
}
