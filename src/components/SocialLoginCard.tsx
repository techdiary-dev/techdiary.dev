"use client";

import { useTranslation } from "@/i18n/use-translation";
import React from "react";

const SocialLoginCard = () => {
  // const { _t } = useTranslation();
  // const [loadingGithub, setLoadingGithub] = React.useState(false);
  // const [loadingGoogle, setLoadingGoogle] = React.useState(false);

  // const socialLogin = async (provider: "github" | "google") => {
  //   setLoadingGithub(true);
  //   setLoadingGoogle(true);
  //   await authClient.signIn.social({ provider });
  //   setLoadingGithub(false);
  //   setLoadingGoogle(false);
  // };
  // return (
  //   <div className="flex flex-col gap-3">
  //     <button
  //       className="flex w-full items-center justify-center space-x-2 rounded-sm border border-gray-800 bg-gray-800/5 py-2 text-gray-700 transition duration-150 hover:opacity-95 dark:border-gray-700 dark:text-gray-400"
  //       onClick={() => socialLogin("github")}
  //     >
  //       {loadingGithub ? (
  //         <svg
  //           className="mr-2 h-5 w-5 animate-spin"
  //           xmlns="http://www.w3.org/2000/svg"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //         >
  //           <circle
  //             className="opacity-25"
  //             cx={12}
  //             cy={12}
  //             r={10}
  //             stroke="currentColor"
  //             strokeWidth={4}
  //           />
  //           <path
  //             className="opacity-75"
  //             fill="currentColor"
  //             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  //           />
  //         </svg>
  //       ) : (
  //         <svg
  //           role="img"
  //           viewBox="0 0 24 24"
  //           xmlns="http://www.w3.org/2000/svg"
  //           className="h-4 w-4 fill-current"
  //         >
  //           <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  //         </svg>
  //       )}
  //       <span className="text-sm">{_t("Login with Github")}</span>
  //     </button>
  //     <button
  //       className="flex w-full items-center justify-center space-x-2 rounded-sm border border-red-500 bg-red-500/10 py-2 text-red-500 transition duration-150 hover:opacity-95"
  //       onClick={() => socialLogin("google")}
  //     >
  //       {loadingGoogle ? (
  //         <svg
  //           className="mr-2 h-5 w-5 animate-spin"
  //           xmlns="http://www.w3.org/2000/svg"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //         >
  //           <circle
  //             className="opacity-25"
  //             cx={12}
  //             cy={12}
  //             r={10}
  //             stroke="currentColor"
  //             strokeWidth={4}
  //           />
  //           <path
  //             className="opacity-75"
  //             fill="currentColor"
  //             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  //           />
  //         </svg>
  //       ) : (
  //         <svg
  //           role="img"
  //           viewBox="0 0 24 24"
  //           xmlns="http://www.w3.org/2000/svg"
  //           className="h-4 w-4 fill-current"
  //         >
  //           <title>Google icon</title>
  //           <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  //         </svg>
  //       )}
  //       <span className="text-sm">{_t("Login with Google")}</span>
  //     </button>

  //     {/* <div>
  //       <Link
  //         href={`/auth/login`}
  //         className="flex gap-2 items-center text-primary underline"
  //       >
  //         {_t("Login using email")}
  //       </Link>
  //     </div> */}
  //   </div>
  // );

  return <h1>Social login</h1>;
};

export default SocialLoginCard;
