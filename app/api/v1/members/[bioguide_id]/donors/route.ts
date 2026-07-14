import { memberCollection } from "@/lib/handlers";
import { options } from "@/lib/response";

// CongressWatch's native name for this array is `top_donors_list`.
export const GET = memberCollection((d) => d.top_donors_list);

export { options as OPTIONS };
