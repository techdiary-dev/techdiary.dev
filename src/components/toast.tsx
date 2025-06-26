"use client";

import React from "react";
import _toast, {
  Toaster as ReactHotToast,
  ToasterProps,
} from "react-hot-toast";

const toast = {
  success: function (message: string) {
    _toast.success(message);
  },
  error: function (message: string) {
    _toast.error(message);
  },
  promise: function <T = unknown>(
    promise: Promise<T> | (() => Promise<T>),
    config?: {
      loading: string;
      success?: string;
      error?: string;
    }
  ) {
    return _toast.promise(promise, {
      loading: config?.loading ?? "Loading",
      success: config?.success ?? "Successful",
      error: config?.error ?? "Unsuccessful",
    });
  },
  // custom: function (() => React.ReactNo) {
  // toast((t) => (
  //   <span>
  //     Custom and <b>bold</b>
  //     <button onClick={() => toast.dismiss(t.id)}>
  //       Dismiss
  //     </button>
  //   </span>
  // ));
  // },
};

const Toaster = (props: ToasterProps) => {
  return <ReactHotToast {...props} />;
};

export { toast, Toaster };
