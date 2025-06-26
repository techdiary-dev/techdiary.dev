import React from "react";

interface Prop extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  Icon: React.ReactNode;
  isDisabled?: boolean;
}
const EditorCommandButton: React.FC<Prop> = ({ isDisabled, Icon, ...props }) => {
  return (
    <button {...props} disabled={isDisabled} type="button">
      {Icon}
    </button>
  );
};

export default EditorCommandButton;
