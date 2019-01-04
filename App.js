import React, {Component} from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  WebView,
} from 'react-native';
import StaticServer from 'react-native-static-server';
import RNFS from 'react-native-fs';

//const path = RNFS.ExternalStorageDirectoryPath + '/Download';
//const server = new StaticServer(3030, path);

export default class App extends Component {
  state = { running: false, permissions: undefined, origin: '' };

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

  componentWillMount() {
    this.port = this.props.port || 3030;
    this.root = this.props.root || "www/";
    this.file = this.props.file || 'index.html';

    // Get HTML file from require
    let html = require('./index.html');
    let {uri} = Image.resolveAssetSource(html);

    let path = RNFS.DocumentDirectoryPath + "/" + this.root;
    let dest = path + this.file;

    // Add the directory
    RNFS.mkdir(path, { NSURLIsExcludedFromBackupKey: true });

    // Fetch the file
    let added;

    if (uri.indexOf("file://") > -1) {
      // Copy file in release
      added =  RNFS.exists(dest).then((e) => {
        if (!e) {
          return RNFS.copyFile(uri, dest);
        }
      });
    } else {
      // Download for development
      let download = RNFS.downloadFile({
        fromUrl: uri,
        toFile: dest
      });
      added = download.promise;
    }

    added.then(() => {
      // Create a StaticServer at port 3030
      this.server = new StaticServer(this.port, this.root, {localOnly: false});

      this.server.start().then((origin) => {
        console.log(origin);
        this.setState({origin});
      });
    }).catch((err) => {
      console.error(err);
    })

  }

  componentWillUnmount() {
    if (this.server) {
      this.server.kill();
    }
  }

  /*
  componentDidMount() {
    console.log('Request');
    // RNFS.mkdir(path + '/Test', { NSURLIsExcludedFromBackupKey: true });
    this.permissionsRequest()
    .then(res => this.setState({ permissions: res }));
  }
  */
  toggleServer = () => {
    const { running } = this.state;
    server.start().then((url) => {
      console.log("Serving at URL", url);
    });
    //this.setState({ running: !running });
  }
  render() {

    if (!this.state.origin) {
      return (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      );
    }

    return (
      <WebView
        source={{uri: `${this.state.origin}/${this.file}`}}
        style={styles.webview}
      />
    );
  }
  /*
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
  */
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
  webview: {
    marginTop: 20,
    flex: 1,
  }
});
