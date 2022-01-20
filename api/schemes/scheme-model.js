const db = require('../../data/db-config')

function find() { // EXERCISE A
  /*
    1A- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`.
    What happens if we change from a LEFT join to an INNER join?

      SELECT
          sc.*,
          count(st.step_id) as number_of_steps
      FROM schemes as sc
      LEFT JOIN steps as st
          ON sc.scheme_id = st.scheme_id
      GROUP BY sc.scheme_id
      ORDER BY sc.scheme_id ASC;

    2A- When you have a grasp on the query go ahead and build it in Knex.
    Return from this function the resulting dataset.
  */
  return db('schemes as sc')
      .leftJoin('steps as st', 'sc.scheme_id', 'st.scheme_id')
      .select('sc.*')
      .count('st.step_id as number_of_steps')
      .groupBy('sc.scheme_id')
      .orderBy('sc.scheme_id', 'ASC')
}

async function findById(scheme_id) {
   const rows = await db('schemes AS sc')
      .leftJoin('steps AS st', 'sc.scheme_id', 'st.scheme_id')
      .select('sc.scheme_name', 'st.*')
      .where('sc.scheme_id', scheme_id)
      .orderBy('st.step_number', 'ASC')

  const result =  {
    scheme_id: rows[0].scheme_id,
    scheme_name: rows[0].scheme_name,
    steps: (rows[0].step_number  > 0) ?
        rows.map(scheme => {
          return ({
            step_id: scheme.step_id,
            step_number: scheme.step_number,
            instructions: scheme.instructions
          })
        }) : []
  }

  return result
}

async function findSteps(scheme_id) { // EXERCISE C

  const rows = await db('schemes AS sc')
      .leftJoin('steps AS st', 'sc.scheme_id', 'st.scheme_id')
      .select('st.step_id', 'st.step_number', 'instructions', 'sc.scheme_name')
      .where('sc.scheme_id', scheme_id)
      .orderBy('step_number')

  if (!rows[0].step_id) return []

  return rows
}

function add(scheme) { // EXERCISE D
  return db('schemes').insert(scheme)
      .then(([scheme_id])=> {
        return db('schemes').where('scheme_id', scheme_id).first()
      })
}

function addStep(scheme_id, step) { // EXERCISE E
  return db('steps').insert({
    ...step,
    scheme_id
  })
      .then(() => {
        return db('steps AS st')
            .join('schemes AS sc', 'sc.scheme_id','st.scheme_id' )
            .select('step_id', 'step_number', 'instructions', 'scheme_name')
            .orderBy('step_number', 'ASC')
            .where('sc.scheme_id', scheme_id)
      })
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
}
