import React from "react";

interface Props {
  size?: number;
}
const Behance: React.FC<Props> = ({ size = 256 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      id="Behance-Logo--Streamline-Logos-Block"
      height={size}
      width={size}
    >
      <path
        fill="var(--color-blue-500)"
        fillRule="evenodd"
        d="M5 1a4 4 0 0 0 -4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4 -4V5a4 4 0 0 0 -4 -4H5Zm9.046 5.886V8.25h4.431V6.886h-4.431Zm2.045 2.387c-1.182 0 -2.13 0.465 -2.778 1.225 -0.642 0.753 -0.972 1.773 -0.972 2.866 0 0.992 0.46 1.928 1.146 2.61 0.685 0.684 1.62 1.14 2.604 1.14 0.994 0 2.007 -0.293 2.858 -0.795l-1.018 -1.775a3.612 3.612 0 0 1 -1.84 0.524c-0.621 0 -1.196 -0.437 -1.5 -1.023H19.5v-1.022c0 -1.904 -1.293 -3.75 -3.41 -3.75Zm-1.907 3.068h3.518c-0.207 -0.78 -0.756 -1.364 -1.611 -1.364 -0.938 0 -1.644 0.472 -1.907 1.364ZM8.42 7.227H4.5v9.546h4.602a2.898 2.898 0 0 0 1.807 -5.163A2.898 2.898 0 0 0 8.42 7.228Zm-1.875 7.841v-2.386h2.216a1.193 1.193 0 1 1 0 2.386H6.545Zm1.535 -3.75a1.193 1.193 0 1 0 0 -2.386H6.545v2.386H8.08Z"
        clipRule="evenodd"
        strokeWidth={1}
      />
    </svg>
  );
};

export default Behance;
