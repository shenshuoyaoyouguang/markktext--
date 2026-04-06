<template>
  <div class="pref-markdown">
    <h4>{{ $t('settings.markdown.title') }}</h4>
    <compound>
      <template #head>
        <h6 class="title">{{ $t('settings.markdown.lists.title') }}:</h6>
      </template>
      <template #children>
        <bool
          :description="$t('settings.markdown.lists.preferLooseList')"
          :bool="preferLooseListItem"
          :onChange="value => onSelectChange('preferLooseListItem', value)"
          more="https://spec.commonmark.org/0.29/#loose"
        ></bool>
        <cur-select
          :description="$t('settings.markdown.lists.bulletMarker')"
          :value="bulletListMarker"
          :options="bulletListMarkerOptions"
          :onChange="value => onSelectChange('bulletListMarker', value)"
          more="https://spec.commonmark.org/0.29/#bullet-list-marker"
        ></cur-select>
        <cur-select
          :description="$t('settings.markdown.lists.orderListDelimiter')"
          :value="orderListDelimiter"
          :options="orderListDelimiterOptions"
          :onChange="value => onSelectChange('orderListDelimiter', value)"
          more="https://spec.commonmark.org/0.29/#ordered-list"
        ></cur-select>
        <cur-select
          :description="$t('settings.markdown.lists.listIndentation')"
          :value="listIndentation"
          :options="listIndentationOptions"
          :onChange="value => onSelectChange('listIndentation', value)"
        ></cur-select>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('settings.markdown.extensions.title') }}:</h6>
      </template>
      <template #children>
        <cur-select
          :description="$t('settings.markdown.extensions.frontmatter')"
          :value="frontmatterType"
          :options="frontmatterTypeOptions"
          :onChange="value => onSelectChange('frontmatterType', value)"
        ></cur-select>
        <bool
          :description="$t('settings.markdown.extensions.superSubScript')"
          :bool="superSubScript"
          :onChange="value => onSelectChange('superSubScript', value)"
          more="https://pandoc.org/MANUAL.html#superscripts-and-subscripts"
        ></bool>
        <bool
          :description="$t('settings.markdown.extensions.footnote')"
          :notes="$t('settings.general.window.requiresRestart')"
          :bool="footnote"
          :onChange="value => onSelectChange('footnote', value)"
          more="https://pandoc.org/MANUAL.html#footnotes"
        ></bool>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('settings.markdown.compatibility.title') }}:</h6>
      </template>
      <template #children>
        <bool
          :description="$t('settings.markdown.compatibility.htmlRendering')"
          :bool="isHtmlEnabled"
          :onChange="value => onSelectChange('isHtmlEnabled', value)"
        ></bool>
        <bool
          :description="$t('settings.markdown.compatibility.gitlabCompatibility')"
          :bool="isGitlabCompatibilityEnabled"
          :onChange="value => onSelectChange('isGitlabCompatibilityEnabled', value)"
        ></bool>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('settings.markdown.diagrams.title') }}:</h6>
      </template>
      <template #children>
        <cur-select
          :description="$t('settings.markdown.diagrams.sequenceTheme')"
          :value="sequenceTheme"
          :options="sequenceThemeOptions"
          :onChange="value => onSelectChange('sequenceTheme', value)"
          more="https://bramp.github.io/js-sequence-diagrams/"
        ></cur-select>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">{{ $t('settings.markdown.misc.title') }}:</h6>
      </template>
      <template #children>
        <cur-select
          :description="$t('settings.markdown.misc.headingStyle')"
          :value="preferHeadingStyle"
          :options="preferHeadingStyleOptions"
          :onChange="value => onSelectChange('preferHeadingStyle', value)"
          :disable="true"
        ></cur-select>
      </template>
    </compound>
  </div>
</template>

<script>
import Compound from '../common/compound'
import Separator from '../common/separator'
import { mapState } from 'vuex'
import Bool from '../common/bool'
import CurSelect from '../common/select'
import { getI18n } from '@/i18n/renderer'
import {
  getBulletListMarkerOptions,
  getOrderListDelimiterOptions,
  getPreferHeadingStyleOptions,
  getListIndentationOptions,
  getFrontmatterTypeOptions,
  getSequenceThemeOptions
} from './config'

export default {
  components: {
    Compound,
    Separator,
    Bool,
    CurSelect
  },
  data () {
    const i18n = getI18n()
    const t = (key) => i18n ? i18n.t(key) : key

    this.bulletListMarkerOptions = getBulletListMarkerOptions(t)
    this.orderListDelimiterOptions = getOrderListDelimiterOptions(t)
    this.preferHeadingStyleOptions = getPreferHeadingStyleOptions(t)
    this.listIndentationOptions = getListIndentationOptions(t)
    this.frontmatterTypeOptions = getFrontmatterTypeOptions(t)
    this.sequenceThemeOptions = getSequenceThemeOptions(t)
    return {}
  },
  computed: {
    ...mapState({
      preferLooseListItem: state => state.preferences.preferLooseListItem,
      bulletListMarker: state => state.preferences.bulletListMarker,
      orderListDelimiter: state => state.preferences.orderListDelimiter,
      preferHeadingStyle: state => state.preferences.preferHeadingStyle,
      listIndentation: state => state.preferences.listIndentation,
      frontmatterType: state => state.preferences.frontmatterType,
      superSubScript: state => state.preferences.superSubScript,
      footnote: state => state.preferences.footnote,
      isHtmlEnabled: state => state.preferences.isHtmlEnabled,
      isGitlabCompatibilityEnabled: state => state.preferences.isGitlabCompatibilityEnabled,
      sequenceTheme: state => state.preferences.sequenceTheme
    }),
    // 使用计算属性动态生成选项，支持语言切换
    bulletListMarkerOptions () {
      return getBulletListMarkerOptions()
    },
    orderListDelimiterOptions () {
      return getOrderListDelimiterOptions()
    },
    preferHeadingStyleOptions () {
      return getPreferHeadingStyleOptions(this.$t)
    },
    listIndentationOptions () {
      return getListIndentationOptions(this.$t)
    },
    frontmatterTypeOptions () {
      return getFrontmatterTypeOptions(this.$t)
    },
    sequenceThemeOptions () {
      return getSequenceThemeOptions(this.$t)
    }
  },
  methods: {
    onSelectChange (type, value) {
      this.$store.dispatch('SET_SINGLE_PREFERENCE', { type, value })
    }
  }
}
</script>

<style scoped>
  .pref-markdown {
  }
</style>
