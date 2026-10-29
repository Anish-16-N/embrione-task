// src/components/TopoBackground.tsx
"use client"

import { useEffect, useRef, useState } from "react"

const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(in vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
    vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
    return dot(n, vec3(70.0));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 aspectUV = uv;
    aspectUV.x *= u_resolution.x / u_resolution.y;

    vec2 mouseUV = u_mouse / u_resolution.xy;
    mouseUV.x *= u_resolution.x / u_resolution.y;

    float dist = distance(aspectUV, mouseUV);
    float mouseInfluence = smoothstep(0.38, 0.0, dist);
    vec2 warpedUV = aspectUV + (aspectUV - mouseUV) * mouseInfluence * 0.08;

    float t = u_time * 0.06;
    float n1 = noise(warpedUV * 2.2 + vec2(t, -t * 0.6));
    float n2 = noise(warpedUV * 4.2 - vec2(t * 0.4, t) + n1 * 0.45);
    float combined = n1 * 0.7 + n2 * 0.3;

    float bands = fract(combined * 6.5);
    float line = smoothstep(0.025, 0.0, abs(bands - 0.5) - 0.006);

    vec3 baseColor = vec3(0.035, 0.035, 0.043);
    vec3 lineColor = mix(
      vec3(0.22, 0.22, 0.26),
      vec3(0.55, 0.44, 0.92),
      mouseInfluence * 0.75
    );

    float vignette = smoothstep(1.15, 0.25, length(uv - 0.5));
    vec3 finalColor = baseColor + line * lineColor * 0.16 * vignette;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

export default function TopoBackground() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        const canvas = canvasRef.current
        if (!canvas) return
        const gl = canvas.getContext("webgl")
        if (!gl) return

        const compileShader = (type: number, source: string) => {
            const shader = gl.createShader(type)
            if (!shader) return null
            gl.shaderSource(shader, source)
            gl.compileShader(shader)
            return shader
        }

        const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER)
        const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
        if (!vs || !fs) return

        const program = gl.createProgram()
        if (!program) return
        gl.attachShader(program, vs)
        gl.attachShader(program, fs)
        gl.linkProgram(program)
        gl.useProgram(program)

        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
        )

        const posLoc = gl.getAttribLocation(program, "position")
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

        const resLoc = gl.getUniformLocation(program, "u_resolution")
        const timeLoc = gl.getUniformLocation(program, "u_time")
        const mouseLoc = gl.getUniformLocation(program, "u_mouse")

        let mouseX = window.innerWidth * 0.5
        let mouseY = window.innerHeight * 0.5
        let targetX = mouseX
        let targetY = mouseY

        const handleResize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
            canvas.width = window.innerWidth * dpr
            canvas.height = window.innerHeight * dpr
            gl.viewport(0, 0, canvas.width, canvas.height)
        }

        const handleMouseMove = (e: MouseEvent) => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
            targetX = e.clientX * dpr
            targetY = (window.innerHeight - e.clientY) * dpr
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        window.addEventListener("mousemove", handleMouseMove, { passive: true })

        let rafId: number
        const startTime = performance.now()

        const render = (now: number) => {
            mouseX += (targetX - mouseX) * 0.06
            mouseY += (targetY - mouseY) * 0.06

            gl.uniform2f(resLoc, canvas.width, canvas.height)
            gl.uniform1f(timeLoc, (now - startTime) * 0.001)
            gl.uniform2f(mouseLoc, mouseX, mouseY)

            gl.drawArrays(gl.TRIANGLES, 0, 6)
            rafId = requestAnimationFrame(render)
        }

        rafId = requestAnimationFrame(render)

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("mousemove", handleMouseMove)
        }
    }, [mounted])

    if (!mounted) return null

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-20 h-full w-full"
        />
    )
}