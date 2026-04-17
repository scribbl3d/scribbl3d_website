import { render, screen } from '@testing-library/react';
import Loader from '../Loader';

describe('Loader', () => {
  it('should render without crashing', () => {
    render(<Loader />);
  });

  it('should render all box elements', () => {
    const { container } = render(<Loader />);
    const boxes = container.querySelectorAll('.box');
    expect(boxes.length).toBe(4);
  });

  it('should have overlay with correct styling', () => {
    const { container } = render(<Loader />);
    const overlay = container.querySelector('div');
    expect(overlay).toBeInTheDocument();
  });

  it('should render boxes container', () => {
    const { container } = render(<Loader />);
    const boxesContainer = container.querySelector('.boxes');
    expect(boxesContainer).toBeInTheDocument();
  });

  it('each box should have 4 child divs', () => {
    const { container } = render(<Loader />);
    const boxes = container.querySelectorAll('.box');
    
    boxes.forEach(box => {
      const children = box.querySelectorAll('div');
      expect(children.length).toBe(4);
    });
  });
});
