### Libraries to use
- For handling dates always use "dateFns"
- Use Zod for validation where applicable
- For icons always use Lucide. Prefer imports suffixed with icon. I.e. `import { CalendarIcon } from "lucide-react"

### Style
- When exporting react components prefer named export `export const SomeComponent = () => {}`

### Organization
We are building both for web and for React Native. That means that all code that can be shared should go into `@tyl/helpers` package.