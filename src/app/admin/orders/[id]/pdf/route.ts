import { createOrderPdfResponse } from "@/lib/order-pdf-download";

interface IOrderPdfRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: IOrderPdfRouteProps) {
  const { id } = await context.params;
  return createOrderPdfResponse(id);
}
