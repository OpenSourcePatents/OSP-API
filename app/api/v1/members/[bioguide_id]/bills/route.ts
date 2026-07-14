import { memberCollection } from "@/lib/handlers";
import { options } from "@/lib/response";

export const GET = memberCollection((d) => d.bills);

export { options as OPTIONS };
