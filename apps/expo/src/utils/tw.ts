import type { TwConfig } from "twrnc";
import { create } from "twrnc";

import TailwindConfig from "../../tailwind.config.js";

// create the customized version...
const tw = create(TailwindConfig as unknown as TwConfig); // <- your path may differ

const tws = tw.style;
export { tw, tws };
