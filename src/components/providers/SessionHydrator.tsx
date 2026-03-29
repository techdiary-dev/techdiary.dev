import * as sessionActions from "@/backend/services/session.actions";
import SessionProvider from "./SessionProvider";

const SessionHydrator = async () => {
  const session = await sessionActions.getSession();
  return <SessionProvider session={session} />;
};

export default SessionHydrator;
