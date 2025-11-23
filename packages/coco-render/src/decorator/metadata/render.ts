import { Metadata, component, target, Target, id } from 'coco-ioc-container';

@id('Render')
@target([Target.Type.Class])
@component()
class Render extends Metadata {}

export default Render;
