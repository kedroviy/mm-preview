import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

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

export const Large: Story = {
  args: {
    children: "Large Button",
    className: "text-lg px-6 py-3",
  },
};

export const Small: Story = {
  args: {
    children: "Small Button",
    className: "text-sm px-3 py-1",
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
