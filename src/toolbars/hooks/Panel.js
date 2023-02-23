/**
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import MenuBase from '@/toolbars/MenuBase';
import { getPanelRule } from '@/utils/regexp';
import { getSelection } from '@/utils/selection';
/**
 * 插入面板
 */
export default class Panel extends MenuBase {
  constructor($cherry) {
    super($cherry);
    this.setName('panel', 'tips');
    this.panelRule = getPanelRule().reg;
    this.subMenuConfig = [
      {
        iconName: 'tips',
        name: 'tips',
        onclick: this.bindSubClick.bind(this, 'primary'),
      },
      {
        iconName: 'info',
        name: 'info',
        onclick: this.bindSubClick.bind(this, 'info'),
      },
      {
        iconName: 'warning',
        name: 'warning',
        onclick: this.bindSubClick.bind(this, 'warning'),
      },
      {
        iconName: 'danger',
        name: 'danger',
        onclick: this.bindSubClick.bind(this, 'danger'),
      },
      {
        iconName: 'success',
        name: 'success',
        onclick: this.bindSubClick.bind(this, 'success'),
      },
    ];
  }

  /**
   * 从字符串中找打面板的name
   * @param {string} str
   * @returns {string | false}
   */
  $getNameFromStr(str) {
    let ret = false;
    str.replace(this.panelRule, (match, preLines, name, content) => {
      ret = name ? name : '';
      return match;
    });
    return ret;
  }

  /**
   * 响应点击事件
   * @param {string} selection 被用户选中的文本内容
   * @param {string} shortKey 快捷键参数
   * @returns {string} 回填到编辑器光标位置/选中文本区域的内容
   */
  onClick(selection, shortKey = '') {
    let $selection = getSelection(this.editor.editor, selection, 'line', true) || '标题\n:\n内容';
    let currentName = this.$getNameFromStr($selection);
    if (currentName === false) {
      // 如果没有命中面板语法，则尝试扩大选区
      this.getMoreSelection('\n', '\n', () => {
        const newSelection = this.editor.editor.getSelection();
        const isMatch = this.$getNameFromStr(newSelection);
        if (isMatch !== false) {
          $selection = newSelection;
          currentName = isMatch;
        }
        return isMatch !== false;
      });
    }
    if (currentName !== false) {
      // 如果命中了面板语法，则尝试去掉语法或者变更语法
      if (currentName === shortKey) {
        // 去掉面板语法
        return $selection.replace(this.panelRule, (match, preLines, name, content) => {
          return content;
        });
      }
      // 修改name
      this.registerAfterClickCb(() => {
        this.setLessSelection('\n', '\n');
      });
      return $selection.replace(this.panelRule, (match, preLines, name, content) => {
        return `:::${shortKey}\n${content}:::`;
      });
    }
    this.registerAfterClickCb(() => {
      this.setLessSelection('\n', '\n');
    });
    return `:::${shortKey}\n${$selection}\n:::`.replace(/\n{2,}:::/g, '\n:::');
  }
}