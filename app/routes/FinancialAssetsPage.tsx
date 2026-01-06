import { PageLayout } from "~/components/ui/PageLayout";
import { FinancialAssetsPageContent } from "./FinancialAssetsPageContent";

export function FinancialAssetsPage() {
  return (
    <PageLayout title="Financial Assets">
      <FinancialAssetsPageContent />
    </PageLayout>
  );
}
