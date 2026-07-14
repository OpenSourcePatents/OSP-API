import { memberCollection } from "@/lib/handlers";
import { options } from "@/lib/response";

export const GET = memberCollection((d) => d.votes);

export { options as OPTIONS };
