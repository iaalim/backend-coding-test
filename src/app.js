'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

module.exports = (db) => {
  app.get('/health', (req, res) => res.send('Healthy'));

  const validateCoordinates = (latitude, longitude) => {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  };

  const validateString = (value) => {
    return typeof value === 'string' && value.length > 0;
  };

  const validateRequest = (req, res, next) => {
    const {
      start_lat,
      start_long,
      end_lat,
      end_long,
      rider_name,
      driver_name,
      driver_vehicle
    } = req.body;

    if (
      !validateCoordinates(Number(start_lat), Number(start_long)) ||
      !validateCoordinates(Number(end_lat), Number(end_long))
    ) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Start and end coordinates are invalid'
      });
    }

    if (!validateString(rider_name)) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non-empty string'
      });
    }

    if (!validateString(driver_name)) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non-empty string'
      });
    }

    if (!validateString(driver_vehicle)) {
      return res.send({
        error_code: 'VALIDATION_ERROR',
        message: 'Driver vehicle must be a non-empty string'
      });
    }

    next();
  };

  const insertRide = (values) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
        values,
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  };

  const getRidesByID = (id) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM Rides WHERE rideID = ?', id, function (err, rows) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  };

  const getRides = (pageSize, offset) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM Rides LIMIT ? OFFSET ?', [pageSize, offset], function (err, rows) {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  };

  app.post('/rides', jsonParser, validateRequest, async (req, res) => {
    const values = [
      req.body.start_lat,
      req.body.start_long,
      req.body.end_lat,
      req.body.end_long,
      req.body.rider_name,
      req.body.driver_name,
      req.body.driver_vehicle
    ];

    try {
      await insertRide(values);

      const rows = await getRidesByID(this.lastID);

      res.send(rows);
    } catch (err) {
      res.send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error'
      });
    }
  });

  app.get('/rides', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter (default: 1)
    const pageSize = parseInt(req.query.pageSize) || 10; // Get the page size from the query parameter (default: 10)

    const offset = (page - 1) * pageSize; // Calculate the offset based on the page and page size

    try {
      const rows = await getRides(pageSize, offset);

      if (rows.length === 0) {
        res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides'
        });
      } else {
        res.send(rows);
      }
    } catch (err) {
      res.send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error'
      });
    }
  });

  app.get('/rides/:id', async (req, res) => {
    try {
      const rows = await getRidesByID(req.params.id);

      if (rows.length === 0) {
        res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides'
        });
      } else {
        res.send(rows);
      }
    } catch (err) {
      res.send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error'
      });
    }
  });

  return app;
};
