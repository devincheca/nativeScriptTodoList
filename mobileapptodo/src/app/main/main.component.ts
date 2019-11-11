import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import * as utils from "tns-core-modules/utils/utils";
import { isIOS, isAndroid } from "tns-core-modules/platform";
import * as frame from "tns-core-modules/ui/frame";
const platformModule = require("tns-core-modules/platform");
import reqService from '../services/reqService';
let req = new reqService();
import helper from '../prototypes/helper';
import list from '../prototypes/list';
import todo from '../prototypes/todo';
import todoService from '../services/todoService';
const service = new todoService();
const appSettings = require("tns-core-modules/application-settings");

@Component({
  selector: 'ns-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }
  
  currentAddNotes:string = '';
  currentHelpers:helper[] = [];
  currentLists:list[] = [];
  currentSearchInput:string = '';
  currentTodos:todo[] = [];
  currentList:string = '';
  helperName:string = '';
  helperPhoneNumber:number = 0;
  lists:string[] = [];
  newListName:string = '';
  newTodos:todo[] = [];
  priorityAddToggle:boolean = false;
  screenHeight:number = 0;
  spinner:boolean = false;
  statusMessage:string = '';
  statusStyle:string = '';
  tabSelectedIndex:number = 0;
  token:string = '';
  
  addHelper():void
  {
    req.req('helper/add',
    {
      token: this.token,
      listName: this.currentList,
      name: this.helperName,
      phoneNumber: this.helperPhoneNumber
    })
    .then((res) =>
    {
      this.currentHelpers.push({
        _id: res._id,
        name: this.helperName,
        phone: '' + this.helperPhoneNumber       
      });
      this.helperName = '';
      this.helperPhoneNumber = 0;
    })
    .catch((error) => { console.trace(error); });
  }
  
  addTodo():void
  {
    this.spinner = true;
    req.req('todo/addTodo',
    {
      token: this.token,
      listName: this.currentList,
      notes: this.currentAddNotes,
      priority: this.priorityAddToggle
    })
    .then((res) =>
    {
      this.spinner = false;
      this.currentTodos.push({
        _id: res._id,
        notes: this.currentAddNotes,
        priority: this.priorityAddToggle,
        done: false,
        flag: false
      });
      this.newTodos.push({
        _id: res._id,
        notes: this.currentAddNotes,
        priority: this.priorityAddToggle,
        done: false,
        flag: false
      });
      this.currentAddNotes = '';
      this.hideKeyboard();
    })
    .catch((error) => { console.trace(error); });
  }
  
  changeList(listname:string):void { this.currentList = listname; }
  
  clearHelper(helperID:string, helperPhone:string):void
  {
    req.req('helper/clearHelper',
    {
      token: this.token,
      listName: this.currentList,
      phoneNumber: parseInt(helperPhone),
      id: helperID
    })
    .then((res) =>
    {
      this.currentHelpers = this.currentHelpers
      .filter((current) => { return current._id !== helperID; });
    })
    .catch((error) => { console.trace(error); });
  }
  
  createList():void
  {
    this.spinner = true;
    req.req('todo/nameList',
    {
      token: this.token,
      newListName: this.newListName
    })
    .then((res) =>
    {
      this.spinner = false;
      this.getLists();
      this.hideKeyboard();
    })
    .catch((error) => { console.trace(error); });
  }

  deleteList(listID:string):void
  {
    req.req('lists/deleteList',
    {
      token: this.token,
      id: listID,
      listname: this.currentLists.filter((current) => { return current._id = listID; })[0].listname
    })
    .then((res) => { this.currentLists = this.currentLists.filter((current) => { return current._id = listID; }); })
    .catch((error) => { console.trace(error); });
  }
 
  deleteTask(id:string):void
  {
    req.req('todo/deleteTask',
    {
      token: this.token,
      listName: this.currentList,
      id: id
    })
    .then((res) =>
    {
      this.currentTodos = this.currentTodos.filter((current) => { return current._id !== id; })
      this.newTodos = this.currentTodos;
    })
    .catch((error) => { console.trace(error); });
  }
  
  filter(event):void
  {
    req.req('todo/search',
    {
      token: this.token,
      listName: this.currentList,
      input: event.object.text
    })
    .then((res) =>
    {
      if (res.length > 0)
      {
        this.currentTodos = service.parseTodos(res);
        this.newTodos = this.currentTodos;
        this.statusMessage = '';
        this.statusStyle = '';
      }
      else
      {
        this.currentTodos = [];
        this.statusMessage = 'Nothing matches search criteria';
        this.statusStyle = 'blue';
      }
    })
    .catch((error) => { console.trace(error); });     
  } 
  
  getClass(index:number, id:string):string
  {
    let result = '';
    if (this.currentTodos.filter((current) => { return current._id === id; })[0].flag)
    {
      result += 'orange';
    }
    else if (this.currentTodos.filter((current) => { return current._id === id; })[0].priority)
    {
      result += 'red';
    }
    else if (this.currentTodos.filter((current) => { return current._id === id; })[0].done)
    {
      result += 'green';
    }
    else
    {
      result += index % 2 === 0 ? 'lightYellow' : 'darkYellow';
    }
    return result; 
  }
  
  getHelpers(listname:string):void
  {
    req.req('helper/getAll',
    {
      token: this.token,
      listName: this.currentList
    })
    .then((res) => { this.currentHelpers = service.parseHelpers(res); })
    .catch((error) => { console.trace(error); });
  }  
  
  async getLists():Promise<string>
  {
    return req.req('lists/getLists', { token: this.token })
    .then((res) =>
    {
      this.currentList = res[0].listname;
      this.currentLists = res;
      this.currentLists.map((current) =>
      {
        req.req('lists/deleteAccess',
        {
          token: this.token,
          listname: current.listname
        })
        .then((res) => { current.deleteAccess = res.access ? true : false; })
        .catch((error) => { console.trace(error); });
      });
      return res[0].listname;
    })
    .catch((error) => { console.trace(error); });
  }
  
  getPriorityClass():string
  {
    return this.priorityAddToggle
      ? 'redButton'
      : 'blueButton';
  }
  
  getTodos():void
  {
    this.spinner = true;
    setTimeout(() =>
    {
      req.req('todo/getTodos',
      {
        token: this.token,
        listName: this.currentList
      })
      .then((res) =>
      {
        this.spinner = false;
        this.currentTodos = service.parseTodos(res);
        this.newTodos = this.currentTodos;
      })
      .catch((error) => { console.trace(error); });
    }, 1500);
  }
  
  hideKeyboard():void
  {
    if (isIOS)
    {
        frame.topmost().nativeView.endEditing(true);
    }
    if (isAndroid)
    {
      utils.ad.dismissSoftInput();
    }
  }
  
  onAddFocus():void { this.currentAddNotes = ''; }
  
  onAddNotesInput(event):void { this.currentAddNotes = event.object.text; }
  
  onHelperName(event):void { this.helperName = event.object.text; }
  
  onHelperPhoneNumber(event):void { this.helperPhoneNumber = event.object.text; }
  
  onNameInput(event):void { this.newListName = event.object.text; }
  
  onListNameInput(event):void { this.newListName = event.object.text; }
  
  onPriorityToggle():void { this.priorityAddToggle = !this.priorityAddToggle; }
  
  onSave():void
  {
    this.spinner = true;
    req.req('todo/updateNotes',
    {
      token: this.token,
      listName: this.currentList,
      todos: this.newTodos
    })
    .then((res) =>
    {
      this.spinner = false;
      this.statusMessage = 'Saved';
      setTimeout(() => { this.statusMessage = ''; }, 1500);
    })
    .catch((error) => { console.trace(error); });
    this.hideKeyboard();
  }
  
  onSelectedIndexChanged(event):void
  {
    if (event.newIndex === 3)
    {
      appSettings.setString('token', '');
      this.router.navigate(['login']);
    }
  } 
  
  onUpdateNotes(event, id:string):void
  {
    this.newTodos = this.newTodos.map((current) =>
    {
      return current._id === id
        ? Object.assign({}, current, { notesChanged: true, notes: event.object.text })
        : current;
    });
  }
  
  toggleTask(action:string, toggle:boolean, id:string):void
  {
    req.req('todo/' + action,
    {
      token: this.token,
      listName: this.currentList,
      [action]: !toggle,
      id: id
    })
    .then((res) =>
    {
      this.currentTodos = this.currentTodos.map((current) =>
      {
        return current._id === id
          ? Object.assign({}, current, { [action]: !toggle })
          : current;
      }); 
    })
    .catch((error) => { console.trace(error); });
  }
  
  ngOnInit():void
  {
    if (appSettings.getString('token') !== undefined
      || appSettings.getString('token') !== '')
    {
      this.token = appSettings.getString('token');
    }
    else
    {
      this.token = this.route.snapshot.params["token"];  
    }
    this.tabSelectedIndex = 0;
    this.getLists()
    .then((listname:string) =>
    {
      this.getTodos();
      this.getHelpers(listname);
    })
    .catch((error) => { console.trace(error); });
    this.screenHeight = platformModule.screen.mainScreen.heightPixels;
  }
}
