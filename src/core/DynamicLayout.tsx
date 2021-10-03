import axios from 'axios';
import {HttpRequest} from 'axios-core';
import * as React from 'react';
import {clone} from 'reflectx';
import {options} from 'uione';
import LazyLoadModule from './LazyLoadModule';

export default class DynamicLayout extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      module: null
    };
    this.httpRequest = new HttpRequest(axios, options);
  }
  protected httpRequest: HttpRequest;
  renderChildren = (childrens, loopData?: any, infoFromParent?: any) => {
    return childrens ? childrens.map((child, idx) => {
      const { tagName, childComponents, isLoopElement } = child;
      const newChildren = childComponents ? [...childComponents] : null;
      let key;

      if (loopData && isLoopElement) {
        const { listAttributes, nameOfListData } = loopData;
        const { listData } = this.props;
        const data = listData.find(obj => obj.name === nameOfListData);
        const arrayChild = [];
        data.data.map((loopEle, loopIdx) => {
          const loopInfo = {
            attrs: listAttributes,
            data: loopEle
          };
          key = `${child.tagName}-${loopIdx}`;
          if (newChildren && newChildren.length > 0) {
            arrayChild.push(this.renderTagToHtmlElement(child, newChildren, key, false, loopInfo));
          } else {
            arrayChild.push(this.renderTagToHtmlElement(child, null, key, false, loopInfo));
          }
        });
        return arrayChild;
      } else {
        if (newChildren && newChildren.length > 0) {
          key = `${tagName}-${idx}`;
          return this.renderTagToHtmlElement(child, newChildren, key, false, infoFromParent);
        } else {
          key = `${tagName}-${idx}`;
          return this.renderTagToHtmlElement(child, null, key, false, infoFromParent);
        }
      }
    }) : null;
  }

  renderTagToHtmlElement = (node, childOfNode = null, key = null, isFirstLoad = false, loopInfo = null) => {
    const { tagName, attributes, childComponents, actions, customs, text, isCustomComponent, path } = node || this.props.json;
    let children = null;

    if (isFirstLoad) {
      children = this.renderChildren(childComponents);
    } else if (node && node.loopData && Object.keys(node.loopData).length > 0) {
      children = childOfNode ? this.renderChildren(childOfNode, node.loopData) : null;
    } else if (loopInfo && !node.loopData) {
      children = childOfNode ? this.renderChildren(childOfNode, null, loopInfo) : null;
    } else {
      children = childOfNode ? this.renderChildren(childOfNode) : null;
    }
    // Append child component
    const totalChildren = [children];
    if (text) {
      if (loopInfo) {
        const { data } = loopInfo;
        totalChildren.unshift(loopInfo.data.text || data[node.text]);
      } else {
        totalChildren.unshift(text === 'titleForm' ?  this.props[text] : this.props.resource[text]);
      }
    }

    if (!isCustomComponent) {
      return React.createElement(tagName, {
        key,
        ...this.formatDataComponent(attributes, false, loopInfo),
        ...this.formatDataComponent(actions, true, loopInfo),
        ...customs
      }, ...totalChildren);
    } else {
      if (path.indexOf('PageSizeSelect') !== -1) {
        return <LazyLoadModule
          resolve={ () => import(`react-page-size-select`) }
          {...this.formatDataCustomComponent(node.attributes)}
        />;
      } else {
        return <LazyLoadModule
          resolve={ () => import(`react-pagination-x`) }
          {...this.formatDataCustomComponent(node.attributes)}
        />;
      }
    }
  }

  formatDataCustomComponent = (element) => {
    const { listData } = this.props;
    const item = clone(element);
    if (item && Object.keys(item).length > 0) {
      const objKeys = Object.keys(item);
      objKeys.forEach(ele => {
        if (!listData) {
          console.log('element', element);
        }
        const temp = listData.find(obj => obj.name === element[ele]);
        if (temp) {
          item[ele] = temp.data;
        }
      });
    }
    return item;
  }

  formatDataComponent = (element, isActions = false, loopInfo = null) => {
    const item = clone(element);

    if (item && Object.keys(item).length > 0) {
      let objKeys = Object.keys(item);
      if (isActions) {
        objKeys = Object.keys(item.events);
      }
      objKeys.forEach(ele => {
        if (ele === 'value') {
          const { modelData, self } = this.props;
          if (item[ele] && typeof item[ele] !== 'string' && item[ele].value) {
            const value = modelData[item[ele].value];
            const func = self[item[ele].formatedBy];
            item[ele] = item[ele].isStaticText ? item[ele].value : func(value);
          } else {
            item[ele] = loopInfo && loopInfo.attrs.indexOf(ele) !== -1 ? loopInfo.data[ele] : modelData[item[ele]];
          }
        } else if (ele === 'placeholder') {
          item[ele] = this.props.resource[item[ele]];
        } else if (ele === 'key') {
          item[ele] = this.props.resource[item[ele]];
        } else if (ele === 'checked') {
          if (typeof (item[ele]) !== 'boolean') {
            const { compareValue, compareSyntax, customFunc, nameOfList } = item[ele];
            if (compareSyntax === '>') {
              item[ele] = item.value > compareValue;
            } else if (compareSyntax === '<') {
              item[ele] = item.value < compareValue;
            } else if (customFunc) {
              const temp = this.props.listData.find(obj => obj.name === nameOfList);
              // Set boolen result if custom condition is true
              item[ele] = temp.data[customFunc](loopInfo.data.value);
            } else {
              item[ele] = this.props.modelData[item.name] === compareValue;
            }
          }
        } else if (isActions) {
          if (item.type === 'application') {
            if (item.params) {
              const params = [];
              item.params.map(param => {
                params.push(loopInfo.data[param]);
              });
              const func = this.props.self[item.events[ele]];
              item.events[ele] = (e) => func(e, ...params);
            } else {
              item.events[ele] = this.props.self[item.events[ele]];
            }
          } else {
            const { method, data, url } = item.events[ele];
            switch (method) {
              case 'get':
                let pathRequest = `${url}`;
                if (data) {
                  pathRequest = `${url}/${data.id}`;
                }
                item.events[ele] =  this.httpRequest.get(pathRequest);
                break;
              case 'post':
                item.events[ele] =   this.httpRequest.post(`${url}`, data.Object);
                break;
              case 'put':
                item.events[ele] =   this.httpRequest.put(`${url}/${data.id}`, data.objhttpOptionsService);
                break;
              case 'delete':
                item.events[ele] =   this.httpRequest.delete(`${url}/${data.id}`);
                break;
              case 'default':
                break;
            }
          }
        }
      });
    }

    return isActions && item && item.events ? item.events : item;
  }

  render() {
    return (
      <React.Fragment>
        { this.renderTagToHtmlElement(null, null, null, true) }
      </React.Fragment>
    );
  }
}

