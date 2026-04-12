/**
 * Узкий entry без PrimeReact — для лендинга и других приложений, где нужны
 * только shadcn-компоненты (меньший client bundle).
 */
export {
  Button as ButtonShadcn,
  type ButtonProps as ButtonPropsShadcn,
  buttonVariants,
} from "./components/button-shadcn/button";
