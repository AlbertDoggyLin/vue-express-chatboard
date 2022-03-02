<template>
    <div id="unity-container" class="unity-desktop">
      <canvas id="unity-canvas" width=960 height=600></canvas>
      <div id="unity-loading-bar">
        <div id="unity-logo"></div>
        <div id="unity-progress-bar-empty">
          <div id="unity-progress-bar-full"></div>
        </div>
      </div>
      <div id="unity-mobile-warning">
        WebGL builds are not supported on mobile devices.
      </div>
      <div id="unity-footer">
        <div id="unity-webgl-logo"></div>
        <div id="unity-fullscreen-button"></div>
        <div id="unity-build-title">webapptest</div>
      </div>
    </div>
</template>

<script>
import { onMounted } from 'vue';

const sendMessage = (object, method, param) => {
  window.gameInstance.SendMessage(object, method, param);
};
export default {
    setup(){
        onMounted(() => {
            const script = document.createElement('script');
            script.onload = () => { 
                console.log('gameLoader onload')
            };
            script.src = `/gameLoader.js`;
            document.head.appendChild(script);
        });
        return {
            sendMessage
        }
    }
}
</script>