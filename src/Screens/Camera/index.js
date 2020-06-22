import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import RNFetchBlob from 'rn-fetch-blob';
import Dialog, {DialogContent, DialogFooter, DialogButton} from 'react-native-popup-dialog';

class Camera extends Component {
  constructor(props){
    super(props);
    global.page = 'Camera'
    this.state = {
      cameraType: 'back',
      torchon: RNCamera.Constants.FlashMode.off,
      mirrorMode : false,
      photoName: '',
      visible: false,
      title: 'Camera'
    }
  }
  
  componentDidMount = async() => {
    global.page = 'Camera'
    this.unscribe = this.props.navigation.addListener('didFocus', () => {
      if (global.imagePath == ''){
        this.setState({imagePath: ''});
        this.setState({flag:1});
      }
    })
    this.unblur = this.props.navigation.addListener('didBlur', () => {
      this.setState({flag:0});
    })
  }

  componentWillUnmount = () => {
    this.unblur.remove();
    this.unscribe.remove();
  }

  changeCameraType() {
    if (this.state.cameraType === 'back') {
      this.setState({
        cameraType: 'front',
        mirror: true
      });
    } else {
      this.setState({
        cameraType: 'back',
        mirror: false
      });
    }
  }

  torchon = () => {
    let tstate = this.state.torchon;
    if (tstate == RNCamera.Constants.FlashMode.off){
        tstate = RNCamera.Constants.FlashMode.torch;
    } else {
        tstate = RNCamera.Constants.FlashMode.off;
    }
    this.setState({torchon:tstate})
  }

  takePicture = async() => {
    let from = this.props.navigation.getParam('from', '')
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      let dirs = RNFetchBlob.fs.dirs
      let path = dirs.DocumentDir;
      let currentTimeStamp = Math.round(new Date().getTime()/1000);
      let realPath = path+`/shopkitty/${currentTimeStamp}.png`;
      RNFetchBlob.fs.cp(data.uri, realPath)
        .then(() => 
        this.setState({imagePath: Platform.OS == 'android'?'file://'+realPath:realPath, photoName: `${currentTimeStamp}.png`},
        () => {
          global.imagePath = this.state.imagePath
          if (from == 'photos'){
            this.props.navigation.goBack()
          }
        }))
        .catch(() => console.log('fail'))
    }
  }

  goLastChat = () => {
    console.log(this.state.visible);
    if (global.lastGroupId == undefined) {
      if(this.state.visible == false){
        this.state.visible = true;
      } else {
        this.state.visible = false;
      }
    } else {
      if (this.props.members != undefined ) {
        this.props.navigation.navigate('Chats')
      } else {
        this.props.navigation.navigate('ChatDetail', {groupId:global.lastGroupId})
      }
    }
  }

  render(){
    const {navigation}=this.props;
    return (
      <View style={styles.container}>
        {Platform.OS == "android" && 
          <StatusBar 
            hidden = {true}/>
        }
        <RNCamera
          ref = {ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={this.state.cameraType}
          flashMode={this.state.torchon}
          mirrorImage={this.state.mirrorMode}
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok', 
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={false}
        />
        <View style={styles.headerViewStyle}>
          <TouchableOpacity onPress={() => {this.props.navigation.openDrawer(), global.page="Camera"}} title="Camera" style={{flex:1, alignItems: 'flex-start'}}>
            <Image source={require('../../assets/ic_menu_white.png')}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.torchon()} style={{flex:1, alignItems:'center'}}>
            <Image source={require('../../assets/ic_flash_white.png')}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.goLastChat()} style={{flex:1, alignItems: 'flex-end'}}>
            <Image source={require('../../assets/ic_chat_white.png')}/>
          </TouchableOpacity>
        </View>
        <View style={styles.footerViewStyle}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Photo', {imagePath: this.state.imagePath, photoName: this.state.photoName})} style={{flex:1, alignItems: 'flex-start', justifyContent: 'center'}}>
            <View style={styles.smallImageView}>
              <Image source={{uri: this.state.imagePath}} style={styles.smallImageIcon}/>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.takePicture()} style={{flex:1, alignItems:'center', justifyContent: 'center'}}>
            <View style={styles.takePhotoStyle}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.changeCameraType()} style={{flex:1, alignItems: 'flex-end', justifyContent: 'center'}}>
            <Image source={require('../../assets/camera_white.png')}/>
          </TouchableOpacity>
        </View>
        <Dialog
          visible={false}
          footer={
            <DialogFooter>
              <DialogButton
                text="OK"
                onPress={() => {this.state.visible = false;console.log(this.state.visible);}}
              />
            </DialogFooter>
          }
          onTouchOutside={() => {
              this.state.visible = false;
          }}
          dialogStyle={styles.dialogStyle}
          >
          <DialogContent>
            <View style={{justifyContent: 'center', alignItems:'center'}}>
              <Text style={{fontSize: 18, fontFamily: 'Roboto-Bold'}}>
                Can not find last chat
              </Text>
            </View>
          </DialogContent>
        </Dialog>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
    },
    preview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    headerViewStyle: {
      position:"absolute", 
      top:Platform.OS == 'ios'? 60:40, 
      flexDirection: 'row', 
      alignContent: 'space-between',
      marginHorizontal: 25
    },
    footerViewStyle: {
      position:'absolute', 
      bottom:Platform.OS == 'ios'?50:30, 
      flexDirection: 'row',
      alignContent: 'space-between',
      marginHorizontal: 25
    },
    takePhotoStyle: {
      backgroundColor: "#FFF", 
      width: 70, 
      height: 70, 
      borderRadius: 60, 
      borderWidth: 6,
      borderColor:'#C4C4C4'
    },
    preview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    capture: {
      flex: 0,
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      paddingHorizontal: 20,
      alignSelf: 'center',
      margin: 20,
    },
    smallImageView: {
      width:40,
      height:40, 
      borderWidth:2, 
      borderRadius: 7, 
      borderColor: '#FFF', 
      backgroundColor: 'black', 
      justifyContent: 'center', 
      alignItems:'center'
    },
    smallImageIcon: {
      width: 40, 
      height:40, 
      borderWidth:2, 
      borderRadius: 7, 
      borderColor: '#FFF'
    },
    dialogStyle: {
      paddingHorizontal: 50,
      paddingVertical: 25
    }
  });
export default Camera;
