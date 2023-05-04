import logger from "./utils/logger";

import app from "./app";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
