import * as admin from "firebase-admin";
import * as serviceAccount from "../../packpoint-5fba2-firebase-adminsdk-svi4j-d958796224.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
