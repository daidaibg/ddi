<template>
  <view class="season-map-page">
    <view class="page-heading">
      <text class="page-kicker">SEASON MAP</text>
      <text class="page-title">赛季地图</text>
      <text class="page-subtitle">手动绘制赛季地图</text>
    </view>

    <view class="map-card">
      <image class="map-image" :src="mapImage" mode="widthFix" show-menu-by-longpress></image>
    </view>

    <view class="guide-card">
      <view class="guide-heading">
        <view>
          <text class="guide-title">公众号使用指引</text>
          <text class="guide-copy">请前往公众号，点击「开炮」后使用。</text>
        </view>
      </view>
      <view class="guide-divider"></view>
      <image
        class="qr-code"
        :src="officialAccountQrUrl"
        mode="aspectFit"
        show-menu-by-longpress
      ></image>
      <text class="qr-tip">长按识别二维码，关注公众号</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';

const defaultMapImage = 'https://www.gaobug.com/img/static/kaipao/map/season-map-result.png';
const officialAccountQrUrl = 'https://www.gaobug.com/img/static/kaipao/map/official-account-qr.jpg';
const mapImage = ref(defaultMapImage);

onLoad((options) => {
  if (options.mapImage) {
    mapImage.value = decodeURIComponent(options.mapImage);
  }
});

const shareTitle = '赛季地图已绘制｜请前往公众号，点击「开炮」后使用';
const shareMapImage = () => encodeURIComponent(mapImage.value);

onShareAppMessage(() => ({
  title: shareTitle,
  path: `/pages/indexApp/kaipao-season-map/kaipao-season-map?mapImage=${shareMapImage()}`,
  imageUrl: mapImage.value,
}));

onShareTimeline(() => ({
  title: shareTitle,
  query: `mapImage=${shareMapImage()}`,
  imageUrl: mapImage.value,
}));
</script>

<style lang="scss">
.season-map-page {
  min-height: 100vh;
  padding: 30rpx 24rpx calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: #eef6ff;
  color: #102a43;
}

.page-heading {
  padding: 4rpx 12rpx 24rpx;
}

.page-kicker,
.page-title,
.page-subtitle,
.guide-title,
.guide-copy,
.qr-tip {
  display: block;
}

.page-kicker {
  color: #1769e0;
  font-size: 20rpx;
  font-weight: 900;
  letter-spacing: 3rpx;
}

.page-title {
  margin-top: 8rpx;
  color: #102a43;
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1.2;
}

.page-subtitle {
  margin-top: 8rpx;
  color: #6b7f96;
  font-size: 25rpx;
  line-height: 1.5;
}

.map-card {
  overflow: hidden;
  border: 6rpx solid #ffffff;
  border-radius: 30rpx;
  background: #dff0ff;
  box-shadow: 0 20rpx 44rpx rgba(23, 105, 224, .18);
}

.map-image {
  display: block;
  width: 100%;
}

.guide-card {
  margin-top: 28rpx;
  padding: 28rpx 24rpx 30rpx;
  border-radius: 30rpx;
  background: #ffffff;
  box-shadow: 0 16rpx 34rpx rgba(54, 93, 132, .12);
  box-sizing: border-box;
  text-align: center;
}

.guide-heading {
  text-align: left;
}

.guide-title {
  color: #102a43;
  font-size: 29rpx;
  font-weight: 900;
  line-height: 1.3;
}

.guide-copy {
  margin-top: 7rpx;
  color: #526d86;
  font-size: 24rpx;
  line-height: 1.45;
}

.guide-divider {
  height: 1rpx;
  margin: 24rpx 0;
  background: #e8f0f8;
}

.qr-code {
  display: block;
  width: 320rpx;
  height: 320rpx;
  margin: 0 auto;
  border: 12rpx solid #f7fbff;
  border-radius: 24rpx;
  box-sizing: border-box;
}

.qr-tip {
  margin-top: 18rpx;
  color: #1769e0;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 1.4;
}
</style>
