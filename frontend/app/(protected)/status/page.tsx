import { Suspense } from "react";
import StatusContent from "./StatusContent";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <StatusContent />
    </Suspense>
  );
}