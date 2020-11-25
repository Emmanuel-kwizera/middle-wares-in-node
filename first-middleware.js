const Joi = require('joi');
const express = require('express')
const config = require('config')
const log = require('./logger')
const auth = require('./authenticate')
const morgan = require('morgan')
const app = express()
app.get('env')
//middle ware
app.use(express.json())
let courses = [
   {id:1, name:'course 1'},
   {id:2, name:'course 2'},
   {id:3, name:'course 3'},
   {id:4, name:'course 4'},
]
if(app.get('env')=='development'){
   app.use(log)
   app.use(morgan('tiny'))
  console.log(`app:env ${app.get('env')}`)
   app.use(auth)
}

console.log(`App settings:.....name:${config.get(`name`)}....company:${config.get(`companyName`)}`)
console.log(`db settings:.....name:${config.get(dbConfig.name)}....user Name:${config.get(dbConfig.username)}....host:${config.get(dbConfig.host)} `)


//get all courses
app.get('/api/courses',(req, res)=>{
   return res.send(courses)
})
//get course by id
app.get('/api/courses/:id/',(req,res)=>{
   //search the course
   let course = courses.find(c =>c.id === parseInt(req.params.id))
   if(!course) return res.status(404).send('Course not found')
   return res.send(course)
})
//insert new course
app.post('/api/courses',(req,res) =>{
   if(!req.body.name || req.body.name.length<4) return res.status(400).send('name is required')
   let course  = {
       id: courses.length +1,
       name: req.body.name,
       instructor: req.body.instructor
   }
   courses.push(course)
   return res.status(201).send(course)
})
//create new and validate with joi
app.post('/api/courses/validated',(req,res) =>{
   const schema = {
       name: Joi.string().min(3).max(30).required()
   }
   const result = Joi.validate(req.body,schema);
   console.log(result)
   if(result.error){
       return res.status(400).send(result.error.details[0].message);
   }
   let course  = {
       id: courses.length +1,
       name: req.body.name,
       instructor: req.body.instructor
   }
   courses.push(course)
   return res.status(201).send(course)
})
//update the course
app.put('/api/courses', (req,res) =>{
   //look up the course using id
   let course = courses.find(c =>c.id === parseInt(req.body.id))
   //if course is not found return 404
   if(!course) return res.status(404).send('Course not found')
   //else validte the body
   const schema = {
       name: Joi.string().min(3).max(30).required(),
       id: Joi.number().required()
   }
   const result = Joi.validate(req.body,schema);
   console.log(result)
   //if there are errors in body return 400
   if(result.error){
       return res.status(400).send(result.error.details[0].message);
   }
   //else update
   course.name = req.body.name
   //return 201 and the course
   return res.status(201).send(course)
})
//delete course
app.delete('/api/courses/:id',(req,res)=>{
   //look up the course
   let course = courses.find(c =>c.id === parseInt(req.params.id))
   //if course not found return 404
   if(!course) return res.status(404).send('Course not found')
   //else remove the course
   const index  = courses.indexOf(course);
   // remove course
   // go to certain and remove one object
   courses.splice(index,1);
   res.send(courses)
})
const port = process.env.PORT || 2020
app.listen(port,()=> console.log(`Server running on port ${port}`))