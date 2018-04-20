/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware, combineReduxers, compose} from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ToolbarAndroid,
  Button,
  ToastAndroid,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Picker,
  Modal,
  TouchableHighlight,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import { List, ListItem } from 'react-native-elements'
const type = 'All';
class LogoTitle extends React.Component {
  render() {
    return (
      <Image
        source={require('./ic_recipe.png')}
        style={{ width: 50, height: 50,marginLeft:10 }}
      />
    );
  }
}

class IconFilter extends React.Component {
  constructor(props){
    super(props);
    this.state = {type : props.type};
  }

  render() {
      return (<View>
      <TouchableOpacity >
        <Image
        source={require('./ic_filter.png')}
        style={{ width: 50, height: 50 }}/>
      </TouchableOpacity>
      </View>);
  }
}

class HomeScreen extends Component{
  constructor(props){
    super(props);
    this.state = {isLoading: true, type: 'All', isFetching: false, Type1: 'All'};
  }

  static navigationOptions = ({navigation}) => ({
    title: 'RecipeApp',
    headerTintColor: '#B5651D',
    headerLeft: <LogoTitle />,
    headerRight: <IconFilter type={type}/>,
  });


  componentDidMount(){
    return this.fetchData();
  }
  componentDidUpdate(){
    if(this.state.type !== this.state.Type1){
      this.fetchData();
      this.setState({type: this.state.Type1});
    }
  }
  fetchData(){
     fetch('https://apppppp.000webhostapp.com/selectall_recipe.php')
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({
            isLoading: false,
            dataSource: responseJson.recipe,
          }, function(){
            if(this.state.Type1 !== 'All'){
              const type= this.state.type
              const newData = responseJson.recipe.filter((item)=>{
                if(item.type.indexOf(type)>-1){
                  return item
                }
              });
              this.setState({dataSource: newData})
            }
            this.setState({isFetching: false});
          });
        })
        .catch((error) => {console.error(error);
        })
  }



  render(){
    if(this.state.isLoading){
      return(
        <View style={{flex:1,padding:20,justifyContent:'center'}}>
            <ActivityIndicator/>
            <Text style={{textAlign:'center',margin: 10}}>Finding Recipe Book...</Text>
        </View>
      )
    }

    return(
          <View style={{flex:1}}>
          <Picker menu={'dropdown'} selectedValue={this.state.Type1}
            onValueChange={(itemValue, itemIndex) => this.setState({Type1: itemValue, isLoading:true})}>
            <Picker.Item label="All" value="All"/>
            <Picker.Item label="Vegetarian" value="Vegetarian"/>
            <Picker.Item label="Fast Food" value="`Fast Food`"/>
            <Picker.Item label="Healthy" value="Healthy"/>
            <Picker.Item label="No-Cook" value="No-Cook"/>
            <Picker.Item label="Make Ahead" value="Make Ahead"/></Picker>
            <ScrollView onRefresh={() => {this.setState({isFetching: true},
              function(){this.fetchData()})}}
            refreshing={this.state.isFetching}>
            <List>
              <FlatList
              onRefresh={() => {this.setState({isFetching: true},
                function(){this.fetchData()})}}
              refreshing={this.state.isFetching}
              data={this.state.dataSource}
              renderItem={({item}) =>
                <ListItem title={item.name} onPress={()=>{
                this.setState({detailId: item.id});
                this.props.navigation.navigate("Details",{navigation: this.props.navigation, detailId:item.id, detailName: item.name, detailIngredient:item.ingredient, detailStep:item.step, detailType:item.type});
                }}/>
              }
              keyExtractor={item => item.id}
              />
              </List>
              </ScrollView>
        <View style={{position: 'absolute', bottom: 0,right: 0,flexDirection:'row',margin:10}}>
        <TouchableOpacity
          style={{borderWidth:1, borderColor:'#B5651D', alignItems:'center', justifyContent:'center', width:70, height:70, backgroundColor:'#fff', borderRadius:150,}}
          onPress={()=>this.props.navigation.navigate("Add")}
        >
          <Image
            source={require('./ic_add.png')}
            style={{ width: 50, height: 50 }}
          />
          </TouchableOpacity>

        </View>
          </View>

    );
  }
}
class Icons extends React.Component {
  constructor(props){
    super(props);
    this.state = {visible: true,
      detailId : this.props.navigation.state.params.detailId,
      detailName: this.props.navigation.state.params.detailName,
      detailIngredient: this.props.navigation.state.params.detailIngredient,
      detailStep: this.props.navigation.state.params.detailStep,
      detailType: this.props.navigation.state.params.detailType,};
  }

  _onPressEdit(){
    this.props.navigation.navigate("Edit",{navigation: this.props.navigation, detailId:this.state.detailId,detailName:this.state.detailName,detailIngredient:this.state.detailIngredient,detailType:this.state.detailType,detailStep:this.state.detailStep});
  }

  _onPressDelete(){
  Alert.alert(
    'Delete Recipe', 'Are you sure to delete?',
    [
      {text: 'Delete', onPress:()=>this.DeleteRecipeFunction()},
      {text: 'Cancel', onPress:()=>this.props.navigation.goBack()}
    ],
    {cancellable: true}
  );
  }

  DeleteRecipeFunction(){
    fetch('https://apppppp.000webhostapp.com/delete_Recipe.php', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.props.id,
      })
    }).then((response) => response.json())
      .then((responseJson) => {
          ToastAndroid.showWithGravity(responseJson.message, ToastAndroid.SHORT,ToastAndroid.CENTER);
          if(responseJson.status === 1){
            this.props.navigation.navigate("Home")
          }else{
            this.props.navigation.goBack()
          }
        }
      ).catch((error) => {
        console.error(error);
      });
  }

  render() {
    return (
      <View style={{flexDirection: 'row', padding:10}}>
        <TouchableOpacity onPress={()=>this._onPressDelete()}>
          <Image
          source={require('./ic_delete.png')}
          style={{ width: 50, height: 50 }}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>this._onPressEdit()}>
          <Image
          source={require('./ic_edit.png')}
          style={{ width: 50, height: 50 }}
          />
          </TouchableOpacity>

      </View>
    );
  }
}

class DetailsScreen extends Component{
  constructor(props){
    super(props);
    this.state = {isLoading: true,
        detailId : this.props.navigation.state.params.detailId,
        detailName: this.props.navigation.state.params.detailName,
        detailIngredient: this.props.navigation.state.params.detailIngredient,
        detailStep: this.props.navigation.state.params.detailStep,
        detailType: this.props.navigation.state.params.detailType,
      };
  }
  static navigationOptions = ({navigation})=>({
    title: 'RecipeApp',
    headerTintColor: '#B5651D',
    headerRight: <Icons navigation={navigation} id={navigation.state.params.detailId}/>
  });

  render(){
    return(
      <View style={{flex: 1, flexDirection:'column'}}>
        <Text style={{textAlign:'right',fontSize: 26}}>Type: {this.state.detailType}</Text>
        <Text style={styles.text}>ID: {this.state.detailId}</Text>
        <Text style={styles.text}>Name: {this.state.detailName}</Text>
        <ScrollView style={{height:150}}>
          <Text style={styles.text}>Ingredient: {this.state.detailIngredient}</Text>
        </ScrollView>
        <ScrollView>
          <Text style={styles.text}>Step(s): {this.state.detailStep}</Text>
        </ScrollView>
        <View style={{flex: 1, left:0, right:0, bottom: 0,flexDirection:'column'}}>
        <Button style={{fontSize: 24, flex:1}}
          title="Go Back"
          onPress={() => this.props.navigation.goBack()}
        />
        </View>
      </View>
    );
}
}

class IconsAdd extends React.Component {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <View style={{flexDirection: 'row', padding:10}}>
        <TouchableOpacity Press={()=>{this.props.ClearAll}}>
          <Image
          source={require('./ic_cancel.png')}
          style={{ width: 50, height: 50 }}/>
        </TouchableOpacity>
        <TouchableOpacity Press={()=>{this.props.addRecipe}}>
          <Image
          source={require('./ic_add.png')}
          style={{ width: 50, height: 50 }}
          />
          </TouchableOpacity>

      </View>
    );
  }
}
class AddScreen extends Component{
  constructor(props){
    super(props);
    this.state = {type: 'Vegetarian'};
    this.AddRecipeFunction = this.AddRecipeFunction.bind(this);
    this.ClearAll = this.ClearAll.bind(this);
  }
  static navigationOptions = ({navigation})=>({
    title: 'RecipeApp',
    headerTintColor: '#B5651D',
    headerRight: <IconsAdd navigation={navigation} addRecipe={this.AddRecipeFunction} ClearAll={this.ClearAll}/>
  });

  ClearAll(){
    this._textInputName.setNativeProps({text: ''});
    ToastAndroid.showWithGravity("ClearAll", ToastAndroid.SHORT,ToastAndroid.CENTER);
  }

  AddRecipeFunction(){

    const { name }  = this.state ;
    const { ingredient }  = this.state ;
    const { step }  = this.state ;
    const { type }  = this.state ;
    fetch('https://apppppp.000webhostapp.com/insert_Recipe.php', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        ingredient: ingredient,
        step: step,
        type: type
      })
    }).then((response) => response.json())
      .then((responseJson) => {
        ToastAndroid.showWithGravity(responseJson.message, ToastAndroid.SHORT,ToastAndroid.CENTER);
        if(responseJson.status == 1){
          this.props.navigation.navigate("Home")
        }
        }
      ).catch((error) => {
        console.error(error);
      });
  }
  render(){
    return(
      <KeyboardAvoidingView behaviour="position">

        <View style={{flexDirection:'row'}}>
          <Text style={styles.textAdd}>Name: </Text>
          <TextInput windowSoftInputMode="adjustResize" ref={component=> this._textInputName = component} style={styles.inputSingle} placeholder="Recipe Name" onChangeText={(name)=> this.setState({name})}/>
        </View>
        <View style={{flexDirection:'row'}}>
        <Text style={styles.textAdd}>Type: </Text>
        <Picker style={{flex:1},styles.inputSingle} menu={'dropdown'} selectedValue={this.state.type}
          onValueChange={(itemValue, itemIndex) => this.setState({type: itemValue})}>
          <Picker.Item label="Vegetarian" value="Vegetarian"/>
          <Picker.Item label="Fast Food" value="`Fast Food`"/>
          <Picker.Item label="Healthy" value="Healthy"/>
          <Picker.Item label="No-Cook" value="No-Cook"/>
          <Picker.Item label="Make Ahead" value="Make Ahead"/></Picker>
        </View>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.textAdd}>Ingredient: </Text>
          <TextInput
          style={{flex: 1, height: 100,fontSize: 22,margin: 10}}
          placeholder="Enter Ingredient(s)"
          onChangeText={(ingredient)=> this.setState({ingredient})}
          multiline = {true} numberOflines = {3}
          />
        </View>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.textAdd}>Step(s): </Text>
          <TextInput
          windowSoftInputMode="adjustResize"
          style={{flex: 1, height: 150,fontSize: 22,margin: 10}}
          placeholder="Enter Steps(s)"
          onChangeText={(step)=> this.setState({step})}
          multiline = {true} numberOflines = {4}
          />
        </View>
        <Button title='Done' onPress={() => this.AddRecipeFunction()}/>

        </KeyboardAvoidingView>


    );
}
}
class EditScreen extends Component{
  constructor(props){
    super(props);
    this.state = {
    detailId : this.props.navigation.state.params.detailId,
    detailName: this.props.navigation.state.params.detailName,
    detailIngredient: this.props.navigation.state.params.detailIngredient,
    detailStep: this.props.navigation.state.params.detailStep,
    detailType: this.props.navigation.state.params.detailType};
  }
  static navigationOptions = {
    title: 'RecipeApp',
    headerTintColor: '#B5651D',
    headerRight: <IconsAdd />
  };

  componentDidMount(){
    this.setState({
      name: this.state.detailName,
      ingredient: this.state.detailIngredient,
      step: this.state.detailStep,
      type: this.state.detailType
      })
  }
  EditRecipeFunction(){
       const { name }  = this.state ;
       const { ingredient }  = this.state ;
       const { step }  = this.state ;
       const { type }  = this.state ;
       fetch('https://apppppp.000webhostapp.com/edit_Recipe.php', {
         method: 'POST',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           id:this.state.detailId,
           name: name,
           ingredient: ingredient,
           step: step,
           type: type
         })
       }).then((response) => response.json())
         .then((responseJson) => {
             ToastAndroid.showWithGravity(responseJson.message, ToastAndroid.SHORT,ToastAndroid.CENTER);
             if(responseJson.status === 1){
             this.props.navigation.navigate("Home")
            }
           }
         ).catch((error) => {
           console.error(error);
         });
     }

  render(){
    return(
      <View style={{flex: 1}}>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.textAdd}>Name: </Text>
          <TextInput style={styles.inputSingle} placeholder="Recipe Name" value={this.state.detailName} onChangeText={(detailName)=>{ this.setState({detailName})}}/>
        </View>
        <View style={{flexDirection:'row'}}>
        <Text style={styles.textAdd}>Type: </Text>
        <Picker style={{flex:1}} menu={'dropdown'} selectedValue={this.state.detailType}
          onValueChange={(itemValue, itemIndex) => this.setState({detailType: itemValue})}>
          <Picker.Item label="Vegetarian" value="Vegetarian"/>
          <Picker.Item label="Fast Food" value="`Fast Food`"/>
          <Picker.Item label="Healthy" value="Healthy"/>
          <Picker.Item label="No-Cook" value="No-Cook"/>
          <Picker.Item label="Make Ahead" value="Make Ahead"/></Picker>
        </View>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.textAdd}>Ingredient: </Text>
          <TextInput
          style={{flex: 1, height: 100,fontSize: 22,margin: 10}}
          placeholder="Enter Ingredient(s)"
          onChangeText={(detailIngredient)=> this.setState({detailIngredient})}
           value={this.state.detailIngredient}
          multiline = {true} numberOflines = {3}
          />
        </View>
        <View style={{flexDirection:'row'}}>
          <Text style={styles.textAdd}>Step(s): </Text>
          <TextInput
          style={{flex: 1, height: 150,fontSize: 22,margin: 10}}
          placeholder="Enter Steps(s)"
          onChangeText={(detailStep)=> this.setState({detailStep})}
           value={this.state.detailStep}
          multiline = {true} numberOflines = {4}
          />
        </View>
        <Button title='Done' onPress={() => this.EditRecipeFunction()}/>
      </View>
    );
}
}
type Props = {};
const RootStack = StackNavigator({Home: {screen: HomeScreen,}, Details: {screen: DetailsScreen,}, Add: {screen: AddScreen,}, Edit: {screen: EditScreen,}},{initialRouteName: 'Home',});

export default class App extends Component<Props> {
  constructor(props){
    super(props);
  }

  render() {

    return <RootStack />;

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  inputSingle: {
    flex: 1,
    height: 50,
    fontSize: 22,
    margin: 10
  },
  text: {
    textAlign:'left',
    fontSize: 22,
    margin: 10
  },
  textAdd: {
    textAlign:'left',
    fontSize: 22,
    marginTop: 20,
    marginLeft:10
  }
});
