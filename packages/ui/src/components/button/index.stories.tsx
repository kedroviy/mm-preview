import type { Meta, StoryObj } from "@storybook/react";
import { Button } from ".";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    severity: {
      control: "select",
      options: ["primary", "secondary", "success", "info", "warning", "danger"],
    },
    outlined: {
      control: "boolean",
    },
    text: {
      control: "boolean",
    },
    rounded: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    size: {
      control: "select",
      options: ["xs", "s", "m", "l", "xl"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Button",
  },
};

export const Outlined: Story = {
  args: {
    children: "Button",
    outlined: true,
  },
};

export const Text: Story = {
  args: {
    children: "Button",
    text: true,
  },
};

export const SizeXs: Story = {
  args: {
    children: "Extra small",
    size: "xs",
  },
};

export const SizeL: Story = {
  args: {
    children: "Large",
    size: "l",
  },
};

export const IconOnly: Story = {
  args: {
    size: "m",
    icon: "pi pi-check",
    "aria-label": "Confirm",
  },
};

export const Rounded: Story = {
  args: {
    children: "Rounded Button",
    rounded: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};
