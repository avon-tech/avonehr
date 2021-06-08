const moment = require("moment");
const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getMessageById = async (req, res) => {
  const { id } = req.params;
  const db = makeDb(configuration, res);
  try {
    const dbResponse = await db.query(
      `select id, subject, message, unread_notify_dt, created, client_id from message where id=?`, [id]
    );

    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const createMessage = async (req, res) => {
  const {unread_notify_dt} = req.body.data;
  const formData = req.body.data;
  formData.client_id = req.client_id;
  formData.unread_notify_dt = moment(unread_notify_dt).format("YYYY-MM-DD");
  formData.created = new Date();
  formData.created_user_id = req.user_id;

  const db = makeDb(configuration, res);
  try {
    const insertResponse = await db.query(`insert into message set ?`, [formData]);

    if (!insertResponse.affectedRows) {
      errorMessage.message = "Insert not successful";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = insertResponse;
    successMessage.message = "Insert successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Insert not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const updateMessage = async (req, res) => {
  const { id } = req.params;
  const formData = req.body.data;
  formData.client_id = req.client_id;
  formData.unread_notify_dt = moment(formData.unread_notify_dt).format("YYYY-MM-DD");
  formData.updated = new Date();
  formData.updated_user_id = req.user_id;

  const db = makeDb(configuration, res);

  try {
    const updateResponse = await db.query(`update message set ? where id=?`, [formData, id]);

    if (!updateResponse.affectedRows) {
      errorMessage.message = "Update not successful";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = updateResponse;
    successMessage.message = "Update successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.message = "Update not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const messageToPatient = {
  getMessageById,
  createMessage,
  updateMessage,
};

module.exports = messageToPatient;
