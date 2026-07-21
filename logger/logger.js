import { createLogger, format, transports } from "winston";

// https://www.highlight.io/blog/nodejs-logging-libraries
// https://blog.appsignal.com/2021/09/01/best-practices-for-logging-in-nodejs.html
// https://medium.com/@trustybytes/streamline-your-node-js-logging-with-winston-a-comprehensive-logging-solution-5612a68c560c
export const logger = createLogger({
	level: "info",
  	format: format.combine(
		format.timestamp(), // adds a timestamp property
		format.json()
	),
  	transports: [
		new transports.Console(),
		new transports.File({ filename: "app.log"})
	],
})