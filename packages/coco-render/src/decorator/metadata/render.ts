import { Metadata, component, target, Target } from 'coco-ioc-container';

@target([Target.Type.Class])
@component()
class Render extends Metadata {}

export default Render;
