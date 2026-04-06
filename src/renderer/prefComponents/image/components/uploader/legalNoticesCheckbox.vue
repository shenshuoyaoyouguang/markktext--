<template>
  <div class="pref-cb-legal-notices">
    <el-checkbox v-model="uploaderService.agreedToLegalNotices"></el-checkbox>
    <span>
      {{ $t('settings.image.uploader.legalNotices.prefix') }} {{ serviceName }}{{ $t('settings.image.uploader.legalNotices.middle') }}
      <span class="link" @click="openUrl(uploaderService.privacyUrl)">{{ $t('settings.image.uploader.legalNotices.privacy') }}</span>
      {{ $t('settings.image.uploader.legalNotices.and') }}
      <span class="link" @click="openUrl(uploaderService.tosUrl)">{{ $t('settings.image.uploader.legalNotices.terms') }}</span>.
      <span v-if="!uploaderService.isGdprCompliant">{{ $t('settings.image.uploader.legalNotices.gdpr') }}</span>
    </span>
  </div>
</template>

<script>
import { shell } from 'electron'
import { getServiceName } from './services'

export default {
  data () {
    return {}
  },
  props: {
    uploaderService: Object,
    uploaderServiceId: String
  },
  computed: {
    serviceName () {
      return getServiceName(this.uploaderServiceId)
    }
  },
  methods: {
    openUrl (link) {
      if (link) {
        shell.openExternal(link)
      }
    }
  }
}
</script>

<style>
.pref-cb-legal-notices {
  border: 1px solid transparent;
  padding: 3px 5px;
  & .el-checkbox {
    margin-right: 0;
  }
}
</style>
