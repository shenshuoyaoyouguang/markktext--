<template>
  <div class="pref-general">
    <h4>{{ $t('settings.general.title') }}</h4>
    <compound>
      <template #head>
        <h6 class="title">{{ $t('settings.general.autoSave.title') }}:</h6>
      </template>
      <template #children>
        <bool
          :description="$t('settings.general.autoSave.description')"
          :bool="autoSave"
          :onChange="value => onSelectChange('autoSave', value)"
        ></bool>
        <range
          :description="$t('settings.general.autoSave.delayDescription')"
          :value="autoSaveDelay"
          :min="1000"
          :max="10000"
          unit="ms"
          :step="100"
          :onChange="value => onSelectChange('autoSaveDelay', value)"
        ></range>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('settings.general.window.title') }}:</h6>
      </template>
      <template #children>
        <cur-select
          v-if="!isOsx"
          :description="$t('settings.general.window.titleBarStyle')"
          :value="titleBarStyle"
          :options="titleBarStyleOptions"
          :onChange="value => onSelectChange('titleBarStyle', value)"
        ></cur-select>
        <bool
          :description="$t('settings.general.window.hideScrollbars')"
          :bool="hideScrollbar"
          :onChange="value => onSelectChange('hideScrollbar', value)"
        ></bool>
        <bool
          :description="$t('settings.general.window.openFilesInNewWindow')"
          :bool="openFilesInNewWindow"
          :onChange="value => onSelectChange('openFilesInNewWindow', value)"
        ></bool>
        <bool
          :description="$t('settings.general.window.openFoldersInNewWindow')"
          :bool="openFolderInNewWindow"
          :onChange="value => onSelectChange('openFolderInNewWindow', value)"
        ></bool>
        <cur-select
          :description="$t('settings.general.window.zoom')"
          :value="zoom"
          :options="zoomOptions"
          :onChange="value => onSelectChange('zoom', value)"
        ></cur-select>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('settings.general.sidebar.title') }}:</h6>
      </template>
      <template #children>
        <bool
          :description="$t('settings.general.sidebar.wrapTextInToc')"
          :bool="wordWrapInToc"
          :onChange="value => onSelectChange('wordWrapInToc', value)"
        ></bool>

        <!-- TODO: The description is very bad and the entry isn't used by the editor. -->
        <cur-select
          :description="$t('settings.general.sidebar.sortField')"
          :value="fileSortBy"
          :options="fileSortByOptions"
          :onChange="value => onSelectChange('fileSortBy', value)"
          :disable="true"
        ></cur-select>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('settings.general.startup.title') }}:</h6>
      </template>
      <template #children>
        <section class="startup-action-ctrl">
          <el-radio-group v-model="startUpAction">
            <!--
              Hide "lastState" for now (#2064).
            <el-radio class="ag-underdevelop" label="lastState">{{ $t('settings.general.startup.restoreSession') }}</el-radio>
            -->
            <el-radio label="folder" style="margin-bottom: 10px;">{{ $t('settings.general.startup.openDefaultDir') }}<span>: {{defaultDirectoryToOpen}}</span></el-radio>
            <el-button size="small" @click="selectDefaultDirectoryToOpen">{{ $t('settings.general.startup.selectFolder') }}</el-button>
            <el-radio label="blank">{{ $t('settings.general.startup.openBlank') }}</el-radio>
          </el-radio-group>
        </section>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('settings.general.misc.title') }}:</h6>
      </template>
      <template #children>
        <cur-select
          :description="$t('settings.general.misc.language')"
          :value="language"
          :options="languageOptions"
          :onChange="value => onSelectChange('language', value)"
        ></cur-select>
      </template>
    </compound>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Compound from '../common/compound'
import Range from '../common/range'
import CurSelect from '../common/select'
import Bool from '../common/bool'
import Separator from '../common/separator'
import { isOsx } from '@/util'
import {
  getTitleBarStyleOptions,
  getZoomOptions,
  getFileSortByOptions,
  getLanguageOptions
} from './config'

export default {
  components: {
    Compound,
    Bool,
    Range,
    CurSelect,
    Separator
  },
  data () {
    return {
      isOsx
    }
  },
  computed: {
    ...mapState({
      autoSave: state => state.preferences.autoSave,
      autoSaveDelay: state => state.preferences.autoSaveDelay,
      titleBarStyle: state => state.preferences.titleBarStyle,
      defaultDirectoryToOpen: state => state.preferences.defaultDirectoryToOpen,
      openFilesInNewWindow: state => state.preferences.openFilesInNewWindow,
      openFolderInNewWindow: state => state.preferences.openFolderInNewWindow,
      zoom: state => state.preferences.zoom,
      hideScrollbar: state => state.preferences.hideScrollbar,
      wordWrapInToc: state => state.preferences.wordWrapInToc,
      fileSortBy: state => state.preferences.fileSortBy,
      language: state => state.preferences.language
    }),
    // 使用计算属性动态生成选项，支持语言切换
    titleBarStyleOptions () {
      return getTitleBarStyleOptions(this.$t)
    },
    zoomOptions () {
      return getZoomOptions(this.$t)
    },
    fileSortByOptions () {
      return getFileSortByOptions(this.$t)
    },
    languageOptions () {
      return getLanguageOptions(this.$t)
    },
    startUpAction: {
      get: function () {
        return this.$store.state.preferences.startUpAction
      },
      set: function (value) {
        const type = 'startUpAction'
        this.$store.dispatch('SET_SINGLE_PREFERENCE', { type, value })
      }
    }
  },
  methods: {
    onSelectChange (type, value) {
      this.$store.dispatch('SET_SINGLE_PREFERENCE', { type, value })
    },
    selectDefaultDirectoryToOpen () {
      this.$store.dispatch('SELECT_DEFAULT_DIRECTORY_TO_OPEN')
    }
  }
}
</script>

<style scoped>
  .pref-general {
    & .startup-action-ctrl {
      font-size: 14px;
      user-select: none;
      color: var(--editorColor);
      & .el-button--small {
        margin-left: 25px;
      }
      & label {
        display: block;
        margin: 20px 0;
      }
    }
  }
</style>
