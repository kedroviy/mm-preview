import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

/**
 * Custom color palette based on:
 * - Platinum: #e7ecef (light background)
 * - Dusk Blue: #274c77 (dark primary)
 * - Steel Blue: #6096ba (medium accent)
 * - Icy Blue: #a3cef1 (light accent)
 * - Grey Olive: #8b8c89 (neutral)
 */
export const AppPreset = definePreset(Aura, {
  semantic: {
    primary: {
      // Dusk Blue palette (main primary color)
      50: "#e8edf3",
      100: "#c4d4e4",
      200: "#9bb5d1",
      300: "#7296be",
      400: "#547faf",
      500: "#3668a0", // Base Dusk Blue
      600: "#274c77", // Main Dusk Blue
      700: "#1f3c5f",
      800: "#172c47",
      900: "#0f1c2f",
      950: "#0a121f",
    },
    secondary: {
      // Steel Blue palette (secondary accent)
      50: "#e8f0f6",
      100: "#c4d9ea",
      200: "#9bbfdc",
      300: "#72a5ce",
      400: "#6096ba", // Main Steel Blue
      500: "#4d7ba5",
      600: "#3d6284",
      700: "#2e4963",
      800: "#1f3042",
      900: "#101721",
      950: "#080b10",
    },
    accent: {
      // Icy Blue palette (light accent)
      50: "#f0f7fd",
      100: "#d4e8fa",
      200: "#b8d9f7",
      300: "#9ccaf4",
      400: "#a3cef1", // Main Icy Blue
      500: "#7fb0e8",
      600: "#5b8fc4",
      700: "#456e9a",
      800: "#2f4d70",
      900: "#192c46",
      950: "#0d161f",
    },
    surface: {
      // Platinum palette (backgrounds)
      50: "#f5f7f8",
      100: "#e7ecef", // Main Platinum
      200: "#d4dde2",
      300: "#c1ced5",
      400: "#aebfc8",
      500: "#9bb0bb",
      600: "#7c8d96",
      700: "#5d6a71",
      800: "#3e474c",
      900: "#1f2427",
      950: "#0f1214",
    },
    neutral: {
      // Grey Olive palette (neutral tones)
      50: "#f4f4f4",
      100: "#e8e8e7",
      200: "#d1d1d0",
      300: "#babad9",
      400: "#a3a3a2",
      500: "#8b8c89", // Main Grey Olive
      600: "#6f706e",
      700: "#535453",
      800: "#373838",
      900: "#1b1c1b",
      950: "#0e0e0e",
    },
    colorScheme: {
      light: {
        primary: {
          color: "#274c77", // Dusk Blue
          inverseColor: "#ffffff",
          hoverColor: "#1f3c5f",
          activeColor: "#172c47",
        },
        secondary: {
          color: "#6096ba", // Steel Blue
          inverseColor: "#ffffff",
          hoverColor: "#4d7ba5",
          activeColor: "#3d6284",
        },
        accent: {
          color: "#a3cef1", // Icy Blue
          inverseColor: "#274c77",
          hoverColor: "#7fb0e8",
          activeColor: "#5b8fc4",
        },
        surface: {
          color: "#e7ecef", // Platinum
          inverseColor: "#274c77",
          hoverColor: "#d4dde2",
          activeColor: "#c1ced5",
        },
        highlight: {
          background: "#274c77", // Dusk Blue
          focusBackground: "#1f3c5f",
          color: "#ffffff",
          focusColor: "#ffffff",
        },
      },
      dark: {
        primary: {
          color: "#a3cef1", // Icy Blue (light in dark mode)
          inverseColor: "#274c77",
          hoverColor: "#7fb0e8",
          activeColor: "#5b8fc4",
        },
        secondary: {
          color: "#6096ba", // Steel Blue
          inverseColor: "#ffffff",
          hoverColor: "#4d7ba5",
          activeColor: "#3d6284",
        },
        accent: {
          color: "#274c77", // Dusk Blue (dark in dark mode)
          inverseColor: "#a3cef1",
          hoverColor: "#1f3c5f",
          activeColor: "#172c47",
        },
        surface: {
          color: "#1f2427", // Dark surface
          inverseColor: "#e7ecef",
          hoverColor: "#2f3437",
          activeColor: "#3f4447",
        },
        highlight: {
          background: "rgba(163, 206, 241, .16)", // Icy Blue with opacity
          focusBackground: "rgba(163, 206, 241, .24)",
          color: "rgba(255,255,255,.87)",
          focusColor: "rgba(255,255,255,.87)",
        },
      },
    },
  },
});

