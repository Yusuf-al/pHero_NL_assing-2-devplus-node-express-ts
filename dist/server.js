

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express3 from "express";

// src/issues/issues.route.ts
import express from "express";

// src/db/db.ts
import { Pool } from "pg";

// src/config/config.ts
import dotenv from "dotenv";
dotenv.config();
var config = {
  port: process.env.PORT || 2525,
  database: process.env.DB_STRING,
  secret: process.env.JWT_SECRET
};

// src/db/db.ts
var pool = new Pool({
  connectionString: config.database
});
var initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

// src/issues/issues.service.ts
var createIssueIntoDB = async (payload) => {
  const { title, description, type, reporter_id, status } = payload;
  const result = await pool.query(
    `
      INSERT INTO issues (title, description, type,status, reporter_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
    [title, description, type, status, reporter_id]
  );
  return result;
};
var getSingleIssue = async (payload) => {
  const { id } = payload;
  let query = `
    SELECT 
      *
    FROM issues 
    WHERE id = $1
  `;
  let userQuery = `
    SELECT 
      *
    FROM users 
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  const issue = rows[0];
  const { rows: userData } = await pool.query(userQuery, [issue.reporter_id]);
  const user = userData[0];
  if (rows.length <= 0) {
    throw new Error(`Issue with id ${id} not found`);
  }
  const formattedIssue = {
    id: issue?.id,
    title: issue?.title,
    description: issue?.description,
    type: issue?.type,
    status: issue?.status,
    reporter: {
      id: issue?.reporter_id,
      name: user?.name,
      role: user?.role
    },
    created_at: issue?.created_at,
    updated_at: issue?.updated_at
  };
  return formattedIssue;
};
var deleteSingleIssue = async (payload) => {
  const { id } = payload;
  let query = `DELETE FROM issues WHERE id = $1`;
  const { rows } = await pool.query(query, [id]);
  if (rows.length > 0) {
    return "Issue is not deleted yet";
  }
  return;
};
var updateIssue = async (payload) => {
  const { id: issue_id, user, body } = payload;
  const { title, description, status, type } = body;
  const selectQuery = `
    SELECT 
      issues.id,
      issues.reporter_id, 
      users.role
    FROM issues 
    JOIN users ON issues.reporter_id = users.id
    WHERE issues.id = $1
  `;
  const { rows } = await pool.query(selectQuery, [issue_id]);
  if (!rows.length) {
    throw new Error("Issue not found");
  }
  const issue = rows[0];
  const isMaintainer = user.role === "maintainer";
  const isContributorAllowed = user.role === "contributor" && issue.reporter_id === user.id && issue.status === "open";
  if (!isContributorAllowed && !isMaintainer) {
    throw new Error(
      "Unauthorized: You do not have permission to update this issue"
    );
  }
  const updateQuery = `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      status = COALESCE($4, status),
      updated_at = NOW()
    WHERE id = $5
    RETURNING *;
  `;
  const { rows: updatedRows } = await pool.query(updateQuery, [
    title,
    description,
    type,
    status,
    issue_id
  ]);
  return updatedRows[0];
};
var getAllIssues = async (payload) => {
  const { sort, type, status } = payload;
  let query = `
    SELECT 
     *
    FROM issues 
  `;
  const conditions = [];
  const params = [];
  if (type) {
    params.push(type);
    conditions.push(`issues.type = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`issues.status = $${params.length}`);
  }
  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }
  if (sort === "newest") {
    query += ` ORDER BY issues.created_at DESC`;
  } else if (sort === "oldest") {
    query += ` ORDER BY issues.created_at ASC`;
  }
  const { rows } = await pool.query(query, params);
  if (!rows.length) return [];
  const issues = rows;
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const usersResult = await pool.query(
    `
  SELECT id, name, role
  FROM users
  WHERE id = ANY($1)
  `,
    [reporterIds]
  );
  const usersMap = new Map(usersResult.rows.map((user) => [user.id, user]));
  const formattedIssues = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: usersMap.get(issue.reporter_id),
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return formattedIssues;
};
var issuesService = {
  createIssueIntoDB,
  getAllIssues,
  getSingleIssue,
  deleteSingleIssue,
  updateIssue
};

// src/utilities/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    message: data.message,
    success: data.success,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const { title, description, type, status } = req.body;
    if (!title || !description || !type) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "All fields are requried"
      });
    }
    const allowedTypes = ["bug", "feature_request"];
    if (!allowedTypes.includes(type)) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid type"
      });
    }
    const allowedStatus = ["open", "in_progress", "resolved"];
    if (status && !allowedStatus.includes(status)) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid status"
      });
    }
    const issue = {
      title,
      description,
      type,
      status: status || "open",
      reporter_id: req.user?.id
    };
    const result = await issuesService.createIssueIntoDB(issue);
    sendResponse_default(res, {
      statusCode: 200,
      message: "Issue created successfully",
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: `Failed to create issue`,
      error
    });
  }
};
var getAllIssues2 = async (req, res) => {
  try {
    const allIssues = await issuesService.getAllIssues(req.query);
    sendResponse_default(res, {
      statusCode: 200,
      message: "All Issues are retrieved successfully",
      success: true,
      data: allIssues
    });
  } catch (error) {
    console.error(error);
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: `Failed to get all the issues`,
      error
    });
  }
};
var getSingleIssue2 = async (req, res) => {
  try {
    const result = await issuesService.getSingleIssue(req.params);
    sendResponse_default(res, {
      statusCode: 200,
      message: "Issue retrived successfully",
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: `Failed to get issue with id ${req.params.id} `,
      error
    });
  }
};
var deleteSingleIssue2 = async (req, res) => {
  try {
    const result = await issuesService.deleteSingleIssue(req.params);
    sendResponse_default(res, {
      statusCode: 200,
      message: "Issue deleted successfully",
      success: true
    });
  } catch (error) {
    console.error(error);
    sendResponse_default(res, {
      statusCode: 500,
      message: `Failed to get issue with id ${req.params.id} `,
      success: false,
      error
    });
  }
};
var updateIssue2 = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const body = req.body;
    const result = await issuesService.updateIssue({ id, user, body });
    sendResponse_default(res, {
      statusCode: 200,
      message: "Issue Updated successfully",
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: `Failed to update issue with id ${req.params.id} `,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues: getAllIssues2,
  getSingleIssue: getSingleIssue2,
  deleteSingleIssue: deleteSingleIssue2,
  updateIssue: updateIssue2
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";

// src/utilities/getLoginUser.ts
var loginUser = async (email) => {
  const userData = await pool.query(
    `
      SELECT * FROM users WHERE email =$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  return userData.rows[0];
};
var getLoginUser_default = loginUser;

// src/middleware/auth.ts
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access"
        });
      }
      const { email } = jwt.verify(
        token,
        config.secret
      );
      const userData = await getLoginUser_default(email);
      req.user = userData;
      delete userData.password;
      if (roles.length && !roles.includes(userData.role)) {
        return res.status(403).json({
          success: false,
          message: "Request forbidden "
        });
      }
      next();
    } catch (error) {
      next(error);
      res.status(403).json({
        success: false,
        message: "Request forbidden "
      });
    }
  };
};
var auth_default = auth;

// src/issues/issues.route.ts
var issueRoute = express.Router();
issueRoute.post("/", auth_default(), issueController.createIssue);
issueRoute.get("/", issueController.getAllIssues);
issueRoute.get("/:id", auth_default(), issueController.getSingleIssue);
issueRoute.put("/:id", auth_default(), issueController.updateIssue);
issueRoute.delete(
  "/:id",
  auth_default("maintainer"),
  issueController.deleteSingleIssue
);
var issues_route_default = issueRoute;

// src/users/user.route.ts
import express2 from "express";

// src/users/user.service.ts
import bcrypt from "bcrypt";
import jwt2 from "jsonwebtoken";
var createUserintoDB = async (payload) => {
  const { name, password, role, email } = payload;
  if (!name || !password || !role || !email) {
    throw new Error("All fields are required");
  }
  const allowedRoles = ["contributor", "maintainer"];
  if (!allowedRoles.includes(role)) {
    throw new Error("Role should be between contributor or maintainer");
  }
  const hashPass = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password, role) 
      VALUES ($1,$2,$3,$4) RETURNING *
    `,
    [name, email, hashPass, role]
  );
  delete result.rows[0].password;
  return result;
};
var userLogin = async (payload) => {
  const { email, password } = payload;
  const userData = await getLoginUser_default(email);
  const isMatch = await bcrypt.compare(password, userData.password);
  if (!isMatch) {
    throw new Error("Invalid Credentials");
  }
  const jwtPayload = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role
  };
  const accessToken = jwt2.sign(jwtPayload, config.secret, {
    expiresIn: "1d"
  });
  return { jwtPayload, accessToken };
};
var userService = {
  createUserintoDB,
  userLogin
};

// src/users/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserintoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      message: "User Created",
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "Failed to create user",
      error
    });
  }
};
var loginUser2 = async (req, res) => {
  try {
    const { accessToken, jwtPayload } = await userService.userLogin(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login Successful",
      data: {
        token: accessToken,
        user: {
          ...jwtPayload
        }
      }
    });
  } catch (error) {
    console.error(error);
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: `Login failed `,
      error
    });
  }
};
var userController = {
  createUser,
  loginUser: loginUser2
};

// src/users/user.route.ts
var userRouter = express2.Router();
userRouter.post("/signup", userController.createUser);
userRouter.post("/login", userController.loginUser);
var user_route_default = userRouter;

// src/middleware/logger.ts
import fs from "fs";
var logger = (req, res, next) => {
  const success = res.statusCode < 400;
  const startTime = Date.now();
  const log = `----------------------------------------  
[${(/* @__PURE__ */ new Date()).toLocaleString()}]
Status    : ${success ? "SUCCESS" : "FAILED"}
Method    : ${req.method}
Route     : ${req.originalUrl}
Code      : ${res.statusCode}
Duration  : ${Date.now() - startTime}ms
IP        : ${req.ip}
Success   : ${success}
Agent     : ${req.headers["user-agent"]}
----------------------------------------
`;
  fs.appendFile("logger.txt", log, (err) => {
    console.log(err);
  });
  next();
};
var logger_default = logger;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
import cors from "cors";
var app = express3();
app.use(express3.json());
app.use(logger_default);
app.use(cors());
app.use("/api/auth", user_route_default);
app.use("/api/issues", issues_route_default);
app.get("/", (req, res) => {
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "server is running"
  });
});
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var PORT = config.port || 2525;
var main = () => {
  initDB();
  app_default.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};
main();
//# sourceMappingURL=server.js.map