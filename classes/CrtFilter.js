'use strict';

class CrtFilter {
  constructor(texture, sourceWidth, sourceHeight) {
    this.enabled = true;
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        gameTexture: { value: texture },
        sourceResolution: { value: new THREE.Vector2(sourceWidth, sourceHeight) },
        outputResolution: { value: new THREE.Vector2(sourceWidth, sourceHeight) },
        crtEnabled: { value: 1 }
      },
      vertexShader: [
        'varying vec2 vUv;',
        '',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision mediump float;',
        '',
        'uniform sampler2D gameTexture;',
        'uniform vec2 sourceResolution;',
        'uniform vec2 outputResolution;',
        'uniform float crtEnabled;',
        'varying vec2 vUv;',
        '',
        'vec2 curveScreen(vec2 uv) {',
        '  vec2 centered = uv * 2.0 - 1.0;',
        '  vec2 curved = centered;',
        '  curved.x *= 1.0 + 0.035 * centered.y * centered.y;',
        '  curved.y *= 1.0 + 0.045 * centered.x * centered.x;',
        '  return curved * 0.5 + 0.5;',
        '}',
        '',
        'vec4 sampleSoftened(vec2 uv) {',
        '  vec2 sourcePosition = uv * sourceResolution - 0.5;',
        '  vec2 sourcePixel = floor(sourcePosition);',
        '  vec2 blend = smoothstep(0.0, 1.0, fract(sourcePosition));',
        '  vec2 texel = 1.0 / sourceResolution;',
        '  vec2 minimumUv = texel * 0.5;',
        '  vec2 maximumUv = 1.0 - minimumUv;',
        '  vec2 topLeft = clamp((sourcePixel + 0.5) * texel, minimumUv, maximumUv);',
        '  vec2 bottomRight = clamp(topLeft + texel, minimumUv, maximumUv);',
        '',
        '  vec4 top = mix(',
        '    texture2D(gameTexture, topLeft),',
        '    texture2D(gameTexture, vec2(bottomRight.x, topLeft.y)),',
        '    blend.x',
        '  );',
        '  vec4 bottom = mix(',
        '    texture2D(gameTexture, vec2(topLeft.x, bottomRight.y)),',
        '    texture2D(gameTexture, bottomRight),',
        '    blend.x',
        '  );',
        '  return mix(top, bottom, blend.y);',
        '}',
        '',
        'void main() {',
        '  if (crtEnabled < 0.5) {',
        '    gl_FragColor = texture2D(gameTexture, vUv);',
        '    return;',
        '  }',
        '',
        '  vec2 displayUv = gl_FragCoord.xy / outputResolution;',
        '  vec2 sampleUv = curveScreen(displayUv);',
        '  vec2 edgeDistance = min(sampleUv, 1.0 - sampleUv);',
        '  float edgeWidth = 2.5 / min(outputResolution.x, outputResolution.y);',
        '  float screenMask = smoothstep(0.0, edgeWidth, min(edgeDistance.x, edgeDistance.y));',
        '  sampleUv = clamp(sampleUv, 0.0, 1.0);',
        '',
        '  vec4 sharpColor = texture2D(gameTexture, sampleUv);',
        '  vec4 softColor = sampleSoftened(sampleUv);',
        '  vec2 texel = 1.0 / sourceResolution;',
        '  vec3 glow = (',
        '    sampleSoftened(sampleUv + vec2(texel.x, 0.0)).rgb +',
        '    sampleSoftened(sampleUv - vec2(texel.x, 0.0)).rgb +',
        '    sampleSoftened(sampleUv + vec2(0.0, texel.y)).rgb +',
        '    sampleSoftened(sampleUv - vec2(0.0, texel.y)).rgb',
        '  ) * 0.25;',
        '  vec3 color = mix(sharpColor.rgb, softColor.rgb, 0.55) + glow * 0.055;',
        '',
        '  float linePosition = abs(fract(sampleUv.y * sourceResolution.y) - 0.5) * 2.0;',
        '  float beam = 1.0 - smoothstep(0.25, 1.0, linePosition);',
        '  float scanline = mix(0.56, 1.03, beam);',
        '  vec2 edge = sampleUv * 2.0 - 1.0;',
        '  float vignette = clamp(1.0 - dot(edge, edge) * 0.08, 0.82, 1.0);',
        '  gl_FragColor = vec4(color * scanline * vignette * screenMask, sharpColor.a);',
        '}'
      ].join('\n'),
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    });
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    this.material.uniforms.crtEnabled.value = this.enabled ? 1 : 0;
  }

  setOutputResolution(width, height) {
    this.material.uniforms.outputResolution.value.set(width, height);
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  dispose() {
    this.material.dispose();
  }
}
