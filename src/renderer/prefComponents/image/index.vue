<template>
  <div class="pref-image">
    <h4>{{ $t('settings.image.title') }}</h4>
    <section class="image-ctrl">
      <div>{{ $t('settings.image.defaultAction') }}
        <el-tooltip class='item' effect='dark'
          :content="$t('settings.image.clipboardNote')"
          placement='top-start'>
          <i class="el-icon-info"></i>
        </el-tooltip>
      </div>
      <CurSelect :value="imageInsertAction" :options="imageActions"
        :onChange="value => onSelectChange('imageInsertAction', value)"></CurSelect>
    </section>
    <Separator />
    <FolderSetting v-if="imageInsertAction === 'folder' || imageInsertAction === 'path'" />
    <Uploader v-if="imageInsertAction === 'upload'" />
  </div>
</template>

<script>
import Separator from '../common/separator'
import Uploader from './components/uploader'
import CurSelect from '@/prefComponents/common/select'
import FolderSetting from './components/folderSetting'
import { getImageActions } from './config'
import { getI18n } from '@/i18n/renderer'

export default {
  components: {
    Separator,
    CurSelect,
    FolderSetting,
    Uploader
  },
  data () {
    const i18n = getI18n()
    const t = (key) => i18n ? i18n.t(key) : key
    this.imageActions = getImageActions(t)

    return {}
  },
  computed: {
    imageInsertAction: {
      get: function () {
        return this.$store.state.preferences.imageInsertAction
      }
    },
    // 使用计算属性动态生成选项，支持语言切换
    imageActions () {
      return getImageActions(this.$t)
    }
  },
  methods: {
    onSelectChange (type, value) {
      this.$store.dispatch('SET_SINGLE_PREFERENCE', { type, value })
    }
  }
}
</script>

<style>
.pref-image {
  & .image-ctrl {
    font-size: 14px;
    margin: 20px 0;
    color: var(--editorColor);
    & label {
      display: block;
      margin: 20px 0;
    }
  }
}
</style>
