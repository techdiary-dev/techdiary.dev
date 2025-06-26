import * as userActions from "@/backend/services/user.action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import _t from "@/i18n/_t";
import GeneralForm from "./_components/GeneralForm";
import SocialMediaForm from "./_components/SocialMediaForm";
import ReadmeForm from "./_components/ReadmeForm";
import { authID } from "@/backend/services/session.actions";

const SettingsPage = async () => {
  const auth_id = await authID();
  const current_user = await userActions.getUserById(auth_id!);

  return (
    <>
      {/* <pre>{JSON.stringify(current_user, null, 2)}</pre> */}
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">{_t("General")}</TabsTrigger>
          <TabsTrigger value="social">{_t("Social")}</TabsTrigger>
          <TabsTrigger value="profile_readme">
            {_t("Profile Readme")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          {current_user && (
            <div className="max-w-2xl my-10">
              <GeneralForm user={current_user} />
            </div>
          )}
        </TabsContent>
        <TabsContent value="social">
          {current_user && (
            <div className="max-w-2xl my-10">
              <SocialMediaForm user={current_user} />
            </div>
          )}
        </TabsContent>
        <TabsContent value="profile_readme">
          {current_user && (
            <div className="max-w-2xl my-10">
              <ReadmeForm user={current_user} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default SettingsPage;
