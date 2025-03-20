import { test } from 'bun:test'
import {  trigger } from '../src/pusher'

test('Posso disparar um pusher', async () => {
    trigger('teste', { messsage: 'ola mundo'})
})