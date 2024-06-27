const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

// Reemplaza el contenido de la ruta con la ruta de tu archivo JSON de credenciales
const serviceAccount = require('./jsonSafealert/safealert-57d97-firebase-adminsdk-qzasz-202d4e3dca.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://safealert-57d97-default-rtdb.firebaseio.com"
});

const app = express();
app.use(bodyParser.json());

// Ruta para eliminar un usuario
app.post('/deleteUser', (req, res) => {
    const uidToDelete = req.body.uid;

    // Eliminar el usuario especificado
    admin.auth().deleteUser(uidToDelete)
        .then(() => {
            res.status(200).send('Successfully deleted user');
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            res.status(500).send('Error deleting user');
        });
});

// Ruta para deshabilitar un usuario
app.post('/disableUser', (req, res) => {
    const uidToDisable = req.body.uid;

    // Deshabilitar el usuario especificado
    admin.auth().updateUser(uidToDisable, { disabled: true })
        .then(() => {
            res.status(200).send('Successfully disabled user');            
        })
        .catch(error => {
            console.error('Error disabling user:', error);
            res.status(500).send('Error disabling user');
        });
});

// Ruta para habilitar un usuario
app.post('/enableUser', (req, res) => {
    const uidToEnable = req.body.uid;

    // Habilitar el usuario especificado
    admin.auth().updateUser(uidToEnable, { disabled: false })
        .then(() => {
            res.status(200).send('Successfully enabled user');
        })
        .catch(error => {
            console.error('Error enabling user:', error);
            res.status(500).send('Error enabling user');
        });
});

app.post('/createUser', (req, res) => {
    const { email, password, displayName, uid } = req.body;

    admin.auth().createUser({
        uid: uid,
        email: email,
        password: password,
        displayName: displayName
    })
    .then(userRecord => {
        res.status(200).send(`Successfully created new user: ${userRecord.uid}`);
    })
    .catch(error => {
        console.error('Error creating new user:', error);
        res.status(500).send('Error creating new user');
    });
});

app.post('/createAlert', (req, res) => {
  const { gravedad, maquinaria, tipo, area, usuario, uid, descripcion } = req.body;

  const sendNotification = (title, body) => {
    let icon, sound;

      switch (gravedad) {
          case 'Alta':
              icon = 'ic_notifications_alta'; // Asegúrate de tener este ícono en tu proyecto Android
              sound = 'alarm01'; // Asegúrate de tener este sonido en tu proyecto Android
             
              break;
          case 'Media':
              icon = 'ic_notifications_media'; // Asegúrate de tener este ícono en tu proyecto Android
              sound = 'default';
              break;
          case 'Baja':
              icon = 'ic_notifications_baja'; // Asegúrate de tener este ícono en tu proyecto Android
              sound = 'default';
              color = 'primary'; 
              break;
      }
      const message = {
          data: {
              title: title,
              body: body,
              color: color,
              sound: sound,
              gravedad: gravedad
          },
          topic: 'all'
      };

      admin.messaging().send(message)
          .then((response) => {
              console.log('Successfully sent message:', response);
          })
          .catch((error) => {
              console.log('Error sending message:', error);
          });
  };

  const title = `Falla ${gravedad} - ${usuario}`;
  const body = `La maquinaria ${maquinaria} ha tenido una falla ${tipo} en el área ${area}. ${descripcion}`
  sendNotification(title, body);

  res.status(200).send('Alerta recibida y procesada');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});