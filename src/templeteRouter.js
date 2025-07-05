import { TEMPLET_SCREEN_CONFIG } from "config/templeteScreenConfig";
import Icon from "@mui/material/Icon";
import { TempletesScreen } from "layouts/templetes/index";

export const SidebarTempleteRoutes = () => {
  const sidebarItems = Object.entries(TEMPLET_SCREEN_CONFIG).map(([key, config]) => ({
    id: key,
    label: config.header,
  }));

  let routes = [];

  for (let index = 0; index < sidebarItems.length; index++) {
    const element = sidebarItems[index];
    // routes.push({
    //   // type: "collapse",
    //   // name: element.label,
    //   // key: element.id,
    //   //component: <TempletesScreen />,
    //   //addToRoute: false,
    // });
  }

  return routes;
};
