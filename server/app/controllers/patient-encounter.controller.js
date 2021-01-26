const moment = require("moment");
const fs = require("fs");
const { configuration, makeDb } = require("../db/db.js");
const { errorMessage, successMessage, status } = require("../helpers/status");

const getEncounters = async (req, res) => {
  const db = makeDb(configuration, res);
  const { patient_id } = req.params;

  try {
    const dbResponse = await db.query(
      `select e.dt, e.id, e.title, et.name encounter_type, concat(u.firstname, ' ', u.lastname) name, notes, treatment
      from encounter e 
      left join encounter_type et on et.id=e.type_id
      left join user u on u.id=e.user_id
      where e.patient_id=${patient_id}
      order by e.dt desc
      limit 50`
    );
    if (!dbResponse) {
      errorMessage.error = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.error = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getEncountersPrescriptions = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select d.name, concat(ds.strength, ds.unit) strength, case when ds.form='T' then 'Tablets' end form, pd.created, case when df.drug_id then true end favorite
      from patient_drug pd
      join drug d on d.id=pd.drug_id
      left join client_drug df on df.client_id=${req.client_id}
          and df.drug_id=d.id
      join drug_strength ds on ds.drug_id=d.id and ds.id=pd.drug_strength_id
      where pd.user_id=${req.user_id}
      order by pd.created desc
      limit 20`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.error = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const getEncountersPrescriptionsFrequencies = async (req, res) => {
  const db = makeDb(configuration, res);

  try {
    const dbResponse = await db.query(
      `select id, descr
      from drug_frequency
      order by id
      limit 100`
    );
    if (!dbResponse) {
      errorMessage.message = "None found";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.error = "Select not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const createEncounter = async (req, res) => {
  const { patient_id } = req.params;
  const { title } = req.body.data;
  let { dt, type_id, notes, treatment, read_dt, lab_bill_to } = req.body.data;

  if (typeof dt !== "undefined") {
    dt = `'${moment(dt).format("YYYY-MM-DD HH:mm:ss")}'`;
  } else {
    dt = null;
  }
  if (typeof type_id !== "undefined") {
    type_id = `'${type_id}'`;
  } else {
    type_id = null;
  }
  if (typeof notes !== "undefined") {
    notes = `'${notes}'`;
  } else {
    notes = null;
  }
  if (typeof treatment !== "undefined") {
    treatment = `'${treatment}'`;
  } else {
    treatment = null;
  }
  if (typeof read_dt !== "undefined") {
    read_dt = `'${moment(read_dt).format("YYYY-MM-DD HH:mm:ss")}'`;
  } else {
    read_dt = null;
  }
  if (typeof lab_bill_to !== "undefined") {
    lab_bill_to = `'${lab_bill_to}'`;
  } else {
    lab_bill_to = null;
  }

  const db = makeDb(configuration, res);
  try {
    const insertResponse = await db.query(
      `insert into encounter (client_id, user_id, patient_id, dt, type_id, title, notes, treatment, read_dt, lab_bill_to, created, created_user_id) 
      values (${req.client_id}, ${req.user_id}, ${patient_id}, ${dt}, ${type_id}, '${title}', ${notes}, ${treatment}, ${read_dt}, ${lab_bill_to}, now(), ${req.user_id})`
    );

    if (!insertResponse.affectedRows) {
      removeFile(req.file);
      errorMessage.error = "Insert not successful";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = insertResponse;
    successMessage.message = "Insert successful";
    return res.status(status.created).send(successMessage);
  } catch (excepErr) {
    errorMessage.error = "Insert not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const updateEncounter = async (req, res) => {
  const { patient_id, id } = req.params;
  const {
    dt,
    type_id,
    title,
    notes,
    treatment,
    read_dt,
    lab_bill_to,
  } = req.body.data;

  const db = makeDb(configuration, res);
  try {
    let $sql;

    $sql = `update encounter set title='${title}', notes='${notes}', treatment='${treatment}' `;

    if (typeof dt !== "undefined") {
      $sql += `, dt='${moment(dt).format("YYYY-MM-DD HH:mm:ss")}'`;
    }
    if (typeof type_id !== "undefined") {
      $sql += `, type_id='${type_id}'`;
    }
    if (typeof read_dt !== "undefined") {
      $sql += `, read_dt='${moment(read_dt).format("YYYY-MM-DD HH:mm:ss")}'`;
    }

    if (typeof lab_bill_to !== "undefined") {
      $sql += `, lab_bill_to=${lab_bill_to}`;
    }

    $sql += `, updated='${moment().format("YYYY-MM-DD HH:mm:ss")}',
    updated_user_id=${req.user_id}
    where patient_id=${patient_id} and id=${id}`;

    const updateResponse = await db.query($sql);
    if (!updateResponse.affectedRows) {
      errorMessage.error = "Update not successful";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = updateResponse;
    successMessage.message = "Update successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    console.log("err", err);
    errorMessage.error = "Update not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const deleteEncounter = async (req, res) => {
  const { id } = req.params;

  const db = makeDb(configuration, res);
  try {
    // Call DB query without assigning into a variable
    const deleteResponse = await db.query(`
      delete from encounter where id=${id}
    `);

    if (!deleteResponse.affectedRows) {
      errorMessage.error = "Deletion not successful";
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = deleteResponse;
    successMessage.message = "Delete successful";
    return res.status(status.created).send(successMessage);
  } catch (err) {
    errorMessage.error = "Delete not successful";
    return res.status(status.error).send(errorMessage);
  } finally {
    await db.close();
  }
};

const patientEncounter = {
  getEncounters,
  getEncountersPrescriptions,
  getEncountersPrescriptionsFrequencies,
  createEncounter,
  updateEncounter,
  deleteEncounter
};

module.exports = patientEncounter;
