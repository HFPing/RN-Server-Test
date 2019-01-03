import React, {Component} from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';
import StaticServer from 'react-native-static-server';
import RNFS from 'react-native-fs';

const path = RNFS.ExternalStorageDirectoryPath + '/Download/Image.jpg';
const server = new StaticServer(8080, path);

export default class App extends Component {
  state = { running: false, permissions: undefined };

  requestReadExtPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          'title': 'RN Server needs permissions',
          'message': 'The app needs to read your files to work'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else return false;
    } catch (err) {
      return false;
    }
  }

  requestWriteExtPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          'title': 'RN Server needs permissions',
          'message': 'The app needs to write your files to work'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else return false;
    } catch (err) {
      return false;
    }
  }

  permissionsRequest = async () => {
    const readPermission = await this.requestReadExtPermission();
    // const writePermission = await this.requestWriteExtPermission();
    return readPermission;
  }

  componentDidMount() {
    console.log('Request');
    this.permissionsRequest()
    .then(res => this.setState({ permissions: res }));
  }

  toggleServer = () => {
    const { running } = this.state;
    server.start().then((url) => {
      console.log("Serving at URL", url);
    });
    //this.setState({ running: !running });
  }

  render() {
    const { permissions } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>
          {permissions ? 'Read/Write Aproved!' : 'Permissions Missing'}
        </Text>
        <Button
          onPress={this.toggleServer}
          title="Stop/Start Server"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
