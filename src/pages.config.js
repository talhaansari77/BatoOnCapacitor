import Dashboard from './pages/Dashboard';
import MyCase from './pages/MyCase';
import Appointments from './pages/Appointments';
import Progress from './pages/Progress';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Shop from './pages/Shop';
import Orders from './pages/Orders';
import MyBilling from './pages/MyBilling';
import TreatmentPlan from './pages/TreatmentPlan';
import Community from './pages/Community';
import MyTreatment from './pages/MyTreatment';
import HairJourney from './pages/HairJourney';
import SkinJourney from './pages/SkinJourney';
import HealthJourney from './pages/HealthJourney';
import LaserJourney from './pages/LaserJourney';
import Welcome from './pages/Welcome';
import Rewards from './pages/Rewards';
import Academy from './pages/Academy';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "MyCase": MyCase,
    "Appointments": Appointments,
    "Progress": Progress,
    "Messages": Messages,
    "Profile": Profile,
    "Onboarding": Onboarding,
    "Shop": Shop,
    "Orders": Orders,
    "MyBilling": MyBilling,
    "TreatmentPlan": TreatmentPlan,
    "Community": Community,
    "MyTreatment": MyTreatment,
    "HairJourney": HairJourney,
    "SkinJourney": SkinJourney,
    "HealthJourney": HealthJourney,
    "LaserJourney": LaserJourney,
    "Welcome": Welcome,
    "Rewards": Rewards,
    "Academy": Academy,
}

export const pagesConfig = {
    mainPage: import.meta.env.MODE === "mobile" ? "Welcome" : "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};