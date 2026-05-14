import { IconType } from "react-icons";
import { BsFillGlobeAmericasFill, BsFillPostcardHeartFill, BsPcDisplayHorizontal} from "react-icons/bs";

type ObjectiveType = {
  title: string;
  icon: IconType;
  description: string;
  btntext?: string;
}


export const OBJECTIVE_SCHEMA: ObjectiveType[] = [{
  title: "Your PVC Journey, Empowered Online.",
  icon: BsFillGlobeAmericasFill as IconType,
  description:
    " As a Nigerian citizen, you can now easily check your PVC registration and collection status online. Our platform gives you accurate location info, helps you find INEC centers in your local government area, and lets you track your registration progress",
    btntext: "Learn More"
},{title: "Become a PVC WAKA Volunteer, Make a Difference.",
  icon: BsFillPostcardHeartFill  as IconType,
  description:
    " Join us as a community volunteer and help guide fellow Nigerians through the PVC registration process. Empower others, provide critical support, and track multiple users under your account—so together, we can ensure no one is left behind.",
    btntext: "Join as Volunteer"
},{title: "Track and Escalate PVC Delays, Demand Accountability.",
  icon: BsPcDisplayHorizontal  as IconType,
  description:
    "We Hold INEC Accountable for You. Our platform allows you to monitor your PVC registration progress. If you face any delays or issues, you can report them easily. We track your case and escalate it to INEC, ensuring your concerns are not ignored and that you get the support you need.",
    btntext: "Report Issue"
}]