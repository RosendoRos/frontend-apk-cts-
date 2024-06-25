import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions} from 'expo-camera';
import * as Location from 'expo-location';
import axios from 'axios';
import moment from 'moment-timezone';

const App: React.FC = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not yet scanned');
  const [isEntrada, setIsEntrada] = useState(false);
  const [isSalida, setIsSalida] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const askForLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso de ubicación denegado');
      return;
    }
    setIsLoading(true);

    try {
      let totalLatitude = 0;
      let totalLongitude = 0;
      const numberOfAttempts = 5;

      for (let i = 0; i < numberOfAttempts; i++) {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        totalLatitude += loc.coords.latitude;
        totalLongitude += loc.coords.longitude;
      }

      const averageLatitude = totalLatitude / numberOfAttempts;
      const averageLongitude = totalLongitude / numberOfAttempts;

      setLocation({
        coords: {
          latitude: averageLatitude,
          longitude: averageLongitude,
          altitude: 0,
          accuracy: 0,
          altitudeAccuracy: 0,
          heading: 0,
          speed: 0
        },
        timestamp: 0
      });
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
      Alert.alert('Error obteniendo la ubicación');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestPermission();
    askForLocationPermission();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setText(data);
    console.log('Data: ' + data);

    const action = isEntrada ? 'entrada' : isSalida ? 'salida' : 'not_defined';

    const qrData = JSON.parse(data);

    const localTimestamp = moment().tz('America/Mexico_City').format('YYYY-MM-DDTHH:mm:ssZ');
    console.log('Local Timestamp:', localTimestamp);

    const scanData = {
      name: qrData.name,
      puesto: qrData.puesto,
      id_unico: qrData.id_unico,
      timestamp: localTimestamp,
      entrada_sali: action,
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      } : null,
    };

    handleScanData(scanData);
  };

  const handleScanData = async (scanData: any) => {
    try {
      await axios.post('http://192.168.9.103:5000/api/scan/save-scan', scanData);
      alert('Datos guardados correctamente');
    } catch (error: any) {
      console.error('Error al guardar datos', error);
      if (error.response && error.response.status === 400) {
        alert(error.response.data);
      } else {
        alert('Hubo un problema al guardar los datos, inténtalo de nuevo');
      }
    }
  };

  if (permission === null || isLoading) {
    return (
      <View style={styles.container}>
        <Text>Requesting for permissions</Text>
        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button title={'Allow Camera'} onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <Button title={'Entrada'} onPress={() => { setIsEntrada(true); setIsSalida(false); }} color={'#003366'} />
        <Button title={'Salida'} onPress={() => { setIsSalida(true); setIsEntrada(false); }} color={'#FFA500'} />
      </View>
      <View style={styles.barcodebox}>
        <CameraView
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{ height: 400, width: 400 }}
        />
      </View>
      <Text style={styles.maintext}>{text}</Text>
      {scanned && <Button title={'Escanear de nuevo'} onPress={() => setScanned(false)} color='tomato' />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'tomato',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
});

export default App;