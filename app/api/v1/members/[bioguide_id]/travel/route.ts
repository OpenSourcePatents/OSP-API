import { memberCollection } from "@/lib/handlers";
import { options } from "@/lib/response";

export const GET = memberCollection((d) => d.travel);

export { options as OPTIONS };
